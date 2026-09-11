#include <SPI.h>
#include <RF24.h>

#define RF_CE_PIN          4
#define RF_CSN_PIN         5

// Existing Pins (Aapke purane code wale pins - No Change)
#define LEFT_FORWARD_PIN   25
#define LEFT_REVERSE_PIN   26
#define RIGHT_FORWARD_PIN  27
#define RIGHT_REVERSE_PIN  14

#define PWM_FREQ           5000
#define PWM_RESOLUTION     8

struct ControlData {
  int throttleY; // -100 to 100
  int steerX;    // -100 to 100
};

ControlData rxData;
RF24 radio(RF_CE_PIN, RF_CSN_PIN);
const byte pipeAddress[6] = "00001";
unsigned long lastPacketTime = 0;

void setMotorSpeeds(int leftSpeed, int rightSpeed);

void setup() {
  Serial.begin(115200);

  // Setup PWM channels using existing pins
  ledcAttach(LEFT_FORWARD_PIN, PWM_FREQ, PWM_RESOLUTION);
  ledcAttach(LEFT_REVERSE_PIN, PWM_FREQ, PWM_RESOLUTION);
  ledcAttach(RIGHT_FORWARD_PIN, PWM_FREQ, PWM_RESOLUTION);
  ledcAttach(RIGHT_REVERSE_PIN, PWM_FREQ, PWM_RESOLUTION);
  setMotorSpeeds(0, 0);

  SPI.begin();
  if (!radio.begin()) {
    Serial.println("NRF24L01 initialization failed!");
    while (1);
  }

  radio.openReadingPipe(0, pipeAddress);
  radio.setPALevel(RF24_PA_LOW);
  radio.startListening();
  Serial.println("Receiver Ready with Updated Drive Logic!");
}

void loop() {
  if (radio.available()) {
    radio.read(&rxData, sizeof(ControlData));
    lastPacketTime = millis();

    // Deadzone check
    int throttle = (abs(rxData.throttleY) > 10) ? rxData.throttleY : 0;
    int steer = (abs(rxData.steerX) > 10) ? rxData.steerX : 0;

    // Direct Arcade / Simplified Driving Logic Mapping
    // Throttle forward/backward ke liye, Steer left/right turn ke liye
    int leftSpeed  = throttle + steer;
    int rightSpeed = throttle - steer;

    // Values ko -255 se 255 ke beech constrain karna
    leftSpeed  = constrain(leftSpeed * 2.55, -255, 255);
    rightSpeed = constrain(rightSpeed * 2.55, -255, 255);

    setMotorSpeeds(leftSpeed, rightSpeed);
  }

  // Safety Fail-safe: Connection disconnect hone par motors rok do
  if (millis() - lastPacketTime > 500) {
    setMotorSpeeds(0, 0);
  }
}

void setMotorSpeeds(int leftSpeed, int rightSpeed) {
  // Left Motors (Pins 25 & 26)
  if (leftSpeed > 0) {
    ledcWrite(LEFT_FORWARD_PIN, leftSpeed);
    ledcWrite(LEFT_REVERSE_PIN, 0);
  } else if (leftSpeed < 0) {
    ledcWrite(LEFT_FORWARD_PIN, 0);
    ledcWrite(LEFT_REVERSE_PIN, abs(leftSpeed));
  } else {
    ledcWrite(LEFT_FORWARD_PIN, 0);
    ledcWrite(LEFT_REVERSE_PIN, 0);
  }

  // Right Motors (Pins 27 & 14)
  if (rightSpeed > 0) {
    ledcWrite(RIGHT_FORWARD_PIN, rightSpeed);
    ledcWrite(RIGHT_REVERSE_PIN, 0);
  } else if (rightSpeed < 0) {
    ledcWrite(RIGHT_FORWARD_PIN, 0);
    ledcWrite(RIGHT_REVERSE_PIN, abs(rightSpeed));
  } else {
    ledcWrite(RIGHT_FORWARD_PIN, 0);
    ledcWrite(RIGHT_REVERSE_PIN, 0);
  }
}
