#include <Arduino.h>
#include <Hash.h>
#include <creds.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <WebSocketsServer.h>

#define STEP 0 //GPIO0---D3 of Nodemcu--Step of stepper motor driver
#define DIR 2 //GPIO2---D4 of Nodemcu--Direction of stepper motor driver
#define WS_PORT 5000

WiFiServer server(80);
WebSocketsServer webSocket = WebSocketsServer(WS_PORT);
int axis_0 = 0;


inline void moveX(uint t, int direction) {
  int i = 0;
  digitalWrite(DIR, direction);
  for(i = 1; i <= 2; i++) {
    digitalWrite(STEP, HIGH);
    delayMicroseconds(t);
    digitalWrite(STEP, LOW);
    delayMicroseconds(t);
  }
}

/**websockets test**/
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("WS disconnected");
            break;
        case WStype_CONNECTED: {
            Serial.println("WS connected");
            }
            break;
        case WStype_ERROR:
          Serial.println("some ws err");
          break;
        case WStype_BIN:
            Serial.println(payload[0]);
            axis_0 = payload[0];
            break;
    }

}



void setup() {
  Serial.begin(115200);
  delay(10);
  pinMode(STEP, OUTPUT); //Step pin as output
  pinMode(DIR,  OUTPUT); //Direcction pin as output

  digitalWrite(STEP, LOW); // Currently no stepper motor movement
  digitalWrite(DIR, LOW);

  // Connect to WiFi network
  Serial.print("Connecting to ");
  Serial.println(LOCAL_SSID);
  WiFi.begin(LOCAL_SSID, LOCAL_PWD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");

  // Start the server
  server.begin();
  Serial.println("Server started");

  // Print the IP address on serial monitor
  Serial.print("Use this URL to connect: ");
  Serial.print("http://");    //URL IP to be typed in mobile/desktop browser
  Serial.print(WiFi.localIP());
  Serial.println("/");

  int i = 0;
  int b = 0;
  int t = 0;

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

}

void loop() {
  // Match the request
  int i=0;
  int value = LOW;

  webSocket.loop();
  // Check if a client has connected
  WiFiClient client = server.available();
  if (client) {
    // Wait until the client sends some data
    Serial.println("new client");
    while(!client.available()){
      delay(1);
    }

    // Read the first line of the request
    String request = client.readStringUntil('\r');
    Serial.println(request);
    client.flush();

    // Return the response
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println(""); //  do not forget this one
    client.println("<!DOCTYPE HTML>");
    client.println("<html>");
    client.println("<h1 align=center>Stepper motor controlled over WiFi</h1><br><br>");
    client.print("Stepper motor moving= ");

    if(value == HIGH) {
      client.print("Forward");
    } else {
      client.print("Backward");
    }
    client.println("<br><br>");
    client.println("<a href=\"/Command=forward\"\"><button>Forward </button></a>");
    client.println("<a href=\"/Command=backward\"\"><button>Backward </button></a><br />");
    client.println("</html>");
    delay(1);
    Serial.println("Client disonnected");
    Serial.println("");

    if (request.indexOf("/Command=forward") != -1)  { //Move 50 steps forward
      digitalWrite(DIR, HIGH); //Rotate stepper motor in clock wise direction
      for( i=1; i<=50; i++) {
        digitalWrite(STEP, HIGH);
        delay(50);
        digitalWrite(STEP, LOW);
        delay(50);
      }
      value = HIGH;
    }

    if (request.indexOf("/Command=backward") != -1)  { //Move 50 steps backwards
      digitalWrite(DIR, LOW); //Rotate stepper motor in anti clock wise direction
      for( i=1; i<=50; i++){
      digitalWrite(STEP, HIGH);
      delay(5);
      digitalWrite(STEP, LOW);
      delay(5);}
      value = LOW;
    }
  }

  if (axis_0 < 90) {
    if (axis_0 < 10) {
      moveX(300, 1);
    } else if (axis_0 < 30) {
      moveX(500, 1);
    } else if (axis_0 < 50) {
      moveX(700, 1);
    } else if (axis_0 < 70) {
      moveX(900, 1);
    } else {
      moveX(1200, 1);
    }
  } else if (axis_0 > 110) {
    if (axis_0 > 190) {
      moveX(300, 0);
    } else if (axis_0 > 170) {
      moveX(500, 0);
    } else if (axis_0 > 150) {
      moveX(700, 0);
    } else if (axis_0 > 130) {
      moveX(900, 0);
    } else {
      moveX(1200, 0);
    }
  }
}
