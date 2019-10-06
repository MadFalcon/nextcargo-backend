
var admin = require("firebase-admin");

var serviceAccount = require("./nextcargopush-firebase-adminsdk-yuwlt-52d5728264.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nextcargopush.firebaseio.com"
});


function notifiyNews(title, body) {

  var message = {
    notification: {
      title: '850',
      body: '2:45'
    }
    ,
    data: {
      key: 'news'
    }
  };

  // Send a message to the device corresponding to the provided
  // registration token.
  admin.messaging().sendToTopic('news', message)
    .then(function (response) {
      console.log("Successfully sent message:", response);
    })
    .catch(function (error) {
      console.log("Error sending message:", error);
    });
}
function PurchaseNotify(body) {
  var registrationToken = 'epDbdfKjlrM:APA91bEwyUILNWRQlqYTcLurajke73Yac1U53LVB79eSrqahBhhNtaDHHEHd4jskW42tugUYoAVa5PB8n7tVzlOxB67HJCPKX9Q6x0LGkGNYQm8CXo7rz4kqAOb21pJKnAHXJnaLJUpL'

  var message = {
    notification: {
      title: 'Новая заявка!',
      body: body
    },
    data: {
      key: 'purchase'
    }
  };
  admin.messaging().sendToTopic('purchase', message)
    .then(function (response) {
      console.log("Successfully sent message:", response);
    })
    .catch(function (error) {
      console.log("Error sending message:", error);
    });
  // Send a message to the device corresponding to the provided
  // registration token.
  // admin.messaging().sendToDevice(registrationToken, message)
  //   .then((response) => {
  //     // Response is a message ID string.
  //     console.log('Successfully sent message:', response);
  //   })
  //   .catch((error) => {
  //     console.log('Error sending message:', error);
  //   });
}
function subscibeToTopic(token, topic) {
  var registrationTokens = token
  console.log(topic)
  if (topic) {
    admin.messaging().subscribeToTopic(registrationTokens, 'news')
      .then(function (response) {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully subscribed to topic:', response);
      })
      .catch(function (error) {
        console.log('Error subscribing to topic:', error);
      });

  } else {
    admin.messaging().subscribeToTopic(registrationTokens, 'news')
      .then(function (response) {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully subscribed to topic:', 'purchase');
      })
      .catch(function (error) {
        console.log('Error subscribing to topic:', error);
      });
    admin.messaging().subscribeToTopic(registrationTokens, 'purchase')
      .then(function (response) {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully subscribed to topic:', response);
      })
      .catch(function (error) {
        console.log('Error subscribing to topic:', error);
      });
  }

  // Subscribe the devices corresponding to the registration tokens to the
  // topic.

}
function unsubscribeToTopic(token, topic) {
  var registrationTokens = token

  // Unsubscribe the devices corresponding to the registration tokens from
  // the topic.

  admin.messaging().unsubscribeFromTopic(registrationTokens, 'news')
    .then(function (response) {
      // See the MessagingTopicManagementResponse reference documentation
      // for the contents of response.
      console.log('Successfully unsubscribed from topic:', response);
    })
    .catch(function (error) {
      console.log('Error unsubscribing from topic:', error);
    });
  admin.messaging().unsubscribeFromTopic(registrationTokens, 'purchase')
    .then(function (response) {
      // See the MessagingTopicManagementResponse reference documentation
      // for the contents of response.
      console.log('Successfully unsubscribed from topic:', response);
    })
    .catch(function (error) {
      console.log('Error unsubscribing from topic:', error);
    });
}
function purchaseStatusChanged(token, body) {

  var message = {
    notification: {
      title: 'Статус вашей заявки изменился',
      body: body
    },
  };


  admin.messaging().sendToDevice(token, message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}
module.exports = {
  notifiyNews: notifiyNews,
  PurchaseNotify: PurchaseNotify,
  subscibeToTopic: subscibeToTopic,
  unsubscribeToTopic: unsubscribeToTopic,
  purchaseStatusChanged: purchaseStatusChanged
}

