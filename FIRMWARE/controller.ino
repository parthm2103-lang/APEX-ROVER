#include <SPI.h>
#include <RF24.h>

#define RF_CE_PIN           4
#define RF_CSN_PIN          5

#define JOY1_Y_THROTTLE_PIN 32 // Joystick 1 Y-Axis -> Forward / Reverse
#define JOY2_X_STEER_PIN    35 // Joystick 2 X-Axis -> Left / Right

struct ControlData {
  int throttleY; // -100 to 100
  int steerX;    // -100 to 100
};

ControlData txData;
RF24 radio(RF_CE_PIN, RF_CSN_PIN);
const byte pipeAddress[6] = "00001";

void setup() {
  Serial.begin(115200);
  SPI.begin();

  if (!radio.begin()) {
    Serial.println("NRF24L01 initialization failed!");
    while (1);
  }

  radio.openWritingPipe(pipeAddress);
  radio.setPALevel(RF24_PA_LOW);
  radio.stopListening();
  Serial.println("Transmitter Ready!");
}

void loop() {
  int rawThrottle = analogRead(JOY1_Y_THROTTLE_PIN);
  int rawSteer    = analogRead(JOY2_X_STEER_PIN);

  // Map joystick values (-100 to 100)
  txData.throttleY = map(rawThrottle, 0, 4095, -100, 100);
  txData.steerX    = map(rawSteer,    0, 4095, -100, 100);

  // Optional: Print values to check joystick response on Serial Monitor
  Serial.print("Throttle: ");
  Serial.print(txData.throttleY);
  Serial.print(" | Steer: ");
  Serial.println(txData.steerX);

  radio.write(&txData, sizeof(ControlData));
  delay(20);
}
