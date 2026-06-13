#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

///////////////////////
// 🔌 PIN DEFINITIONS
///////////////////////
#define RELAY1 5
#define RELAY2 12
#define RELAY3 13

#define SW1 14
#define SW2 4
#define SW3 2

///////////////////////
// 📶 WIFI
///////////////////////
const char* ssid = "ICN 1st floor 4";
const char* password = "Akash@445";

///////////////////////
// 🌐 MQTT
///////////////////////
const char* mqtt_server = "8644400fc9e448468233fc0f9be265a0.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;

const char* mqtt_user = "ParqHome_Hardware";
const char* mqtt_pass = "ParqHome_Hardware@123";

///////////////////////
// 👨‍👩‍👧 FAMILY ID
///////////////////////
const char* familyId = "ZUH-812280";

///////////////////////
// 📡 TOPICS
///////////////////////
const char* topic_control = "home/esp/control";
const char* topic_status  = "home/esp/status";

///////////////////////
// 🧠 STATE
///////////////////////
bool light1State = false;
bool light2State = false;
bool fanState    = false;

///////////////////////
// ⏱️ DEBOUNCE
///////////////////////
unsigned long lastDebounceTime[3] = {0,0,0};
const int debounceDelay = 200;

int lastSwitchState[3] = {HIGH, HIGH, HIGH};
bool pressed[3] = {false, false, false};

///////////////////////
// CLIENTS
///////////////////////
WiFiClientSecure espClient;
PubSubClient client(espClient);

///////////////////////
// 🔌 RELAY CONTROL
///////////////////////
void updateRelay(int pin, bool state) {
  digitalWrite(pin, state ? LOW : HIGH);
}

void applyStates() {
  updateRelay(RELAY1, light1State);
  updateRelay(RELAY2, light2State);
  updateRelay(RELAY3, fanState);
}

///////////////////////
// 📤 SEND STATUS
///////////////////////
void publishState() {

  String msg1 = "{\"source\":\"device\",\"familyId\":\"" + String(familyId) + "\",\"switchId\":\"001\",\"status\":" + String(light1State ? "true" : "false") + "}";
  String msg2 = "{\"source\":\"device\",\"familyId\":\"" + String(familyId) + "\",\"switchId\":\"002\",\"status\":" + String(light2State ? "true" : "false") + "}";
  String msg3 = "{\"source\":\"device\",\"familyId\":\"" + String(familyId) + "\",\"switchId\":\"003\",\"status\":" + String(fanState ? "true" : "false") + "}";

  client.publish(topic_status, msg1.c_str(), true);
  client.publish(topic_status, msg2.c_str(), true);
  client.publish(topic_status, msg3.c_str(), true);

  Serial.println("Status sent");
}

///////////////////////
// 📥 RECEIVE CONTROL
///////////////////////
void callback(char* topic, byte* payload, unsigned int length) {

  String msg = "";
  for (int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.println("Received:");
  Serial.println(msg);

  // ✅ FIXED FAMILY CHECK (robust)
  if (msg.indexOf(familyId) < 0) {
    Serial.println("Ignored (wrong familyId)");
    return;
  }

  bool state = (msg.indexOf("\"status\":true") >= 0);

  if (msg.indexOf("\"switchId\":\"001\"") >= 0) {
    light1State = state;
    Serial.println("MQTT → Switch 1 → " + String(state ? "ON" : "OFF"));
  }

  else if (msg.indexOf("\"switchId\":\"002\"") >= 0) {
    light2State = state;
    Serial.println("MQTT → Switch 2 → " + String(state ? "ON" : "OFF"));
  }

  else if (msg.indexOf("\"switchId\":\"003\"") >= 0) {
    fanState = state;
    Serial.println("MQTT → Switch 3 → " + String(state ? "ON" : "OFF"));
  }

  applyStates();

  // ❌ NO publish here (prevents loop)
}

///////////////////////
// 📶 WIFI CONNECT
///////////////////////
void connectWiFi() {
  Serial.println("Connecting WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
}

///////////////////////
// 🔁 MQTT CONNECT
///////////////////////
void reconnectMQTT() {
  while (!client.connected()) {

    Serial.println("Connecting MQTT...");

    String clientId = "ParqHome_" + String(ESP.getChipId());

    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {

      Serial.println("MQTT Connected");

      client.subscribe(topic_control);

      publishState(); // sync UI on reconnect

    } else {
      Serial.print("Failed, rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

///////////////////////
// 🔘 SWITCH HANDLER
///////////////////////
void handleSwitch(int pin, int index, bool &stateVar, int switchId) {

  int reading = digitalRead(pin);

  if (reading != lastSwitchState[index]) {
    lastDebounceTime[index] = millis();
  }

  if ((millis() - lastDebounceTime[index]) > debounceDelay) {

    if (reading == LOW && !pressed[index]) {

      pressed[index] = true;
      stateVar = !stateVar;

      Serial.print("Switch ");
      Serial.print(switchId);
      Serial.print(" → ");
      Serial.println(stateVar ? "ON" : "OFF");

      applyStates();

      String msg = "{\"source\":\"device\",\"familyId\":\"" + String(familyId) +
                   "\",\"switchId\":\"00" + String(switchId) +
                   "\",\"status\":" + String(stateVar ? "true" : "false") + "}";

      client.publish(topic_status, msg.c_str(), true);
    }

    if (reading == HIGH) {
      pressed[index] = false;
    }
  }

  lastSwitchState[index] = reading;
}

///////////////////////
// ⚙️ SETUP
///////////////////////
void setup() {

  Serial.begin(115200);

  pinMode(RELAY1, OUTPUT);
  pinMode(RELAY2, OUTPUT);
  pinMode(RELAY3, OUTPUT);

  pinMode(SW1, INPUT_PULLUP);
  pinMode(SW2, INPUT_PULLUP);
  pinMode(SW3, INPUT_PULLUP);

  applyStates();

  connectWiFi();

  espClient.setInsecure();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

///////////////////////
// 🔁 LOOP
///////////////////////
void loop() {

  if (!client.connected()) {
    Serial.println("MQTT disconnected, reconnecting...");
    reconnectMQTT();
  }

  client.loop();

  handleSwitch(SW1, 0, light1State, 1);
  handleSwitch(SW2, 1, light2State, 2);
  handleSwitch(SW3, 2, fanState, 3);

  delay(10);
}