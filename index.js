const express = require('express');
const app = express();
const mongoose = require('mongoose');
let db;
const bodyParser = require('body-parser');
const DeliveryItem = require('./schemas/deliveryItemScheme');
const User = require('./schemas/userScheme');
const News = require('./schemas/newsScheme');
const decrypt = require('./decrypt');
const crypt = require('./crypt');

const Notify = require('./sendNewsNotification');
const multer = require('multer')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/news'));



const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './images')
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  }
})
const Storage2 = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './news')
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  }
})
const upload = multer({ storage: Storage, limits: { fieldSize: 25 * 1024 * 1024 } })
const uploadNews = multer({ storage: Storage2, limits: { fieldSize: 25 * 1024 * 1024 } })

app.post('/login', function (req, res) {

  let decryptedData = decrypt(req.body.data)
  User.findOne({ email: decryptedData.email.toLowerCase() }).exec(function (err, data) {
    if (!err) {
      if (data !== null) {
        if (decryptedData.password === data.password) {

          res.send(crypt(data));
          Notify.subscibeToTopic(decryptedData.token, (data.role === 'user' ? true : false))
          if (decryptedData.token !== data.token) {
            data.token = decryptedData.token;
            data.save(function (err) {
              if (!err) {
                console.log('ok');
              } else {
                console.log(err);
              }
            });
          }
        } else {
          console.log('pass');
          res.sendStatus(400);
        }
      } else {
        console.log('data null');
        res.sendStatus(500);
      }
    } else {
      console.log(err);
      console.log('some err');
      res.sendStatus(503);
    }
  });
});
app.post('/register/', function (req, res) {
  let decryptedData = decrypt(req.body.data)


  let newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: decryptedData.firstName,
    lastName: decryptedData.lastName,
    phoneNumber: decryptedData.phoneNumber,
    userAddres: decryptedData.userAddres,
    email: decryptedData.email.toLowerCase(),
    password: decryptedData.password,
    role: decryptedData.role,
    token: decryptedData.token
  });
  newUser.save(function (err) {
    if (!err) {
      console.log('ok');

      return res.send(crypt('200'));
    } else {
      console.log(err);
      res.sendStatus(500);
    }
  });
});
app.get('/news', function (req, res) {
  News.find({})
    .exec(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.send(data);
      }
    });
});
app.post('/news/delete', function (req, res) {
  let decryptedData = decrypt(req.body.data)
  News.findByIdAndDelete(decryptedData._id, function (err, data) {
    if (!err) {
      console.log(data)
      res.send(data)
    } else {
      console.log(err)
      res.send(crypt('500'))
    }
  })

});
app.post('/news/add/', uploadNews.array('photo', 2), function (req, res) {
  let photo = req.files[0] !== undefined ? req.files[0].filename : ''
  console.log('tttt')
  let decryptedData = decrypt(req.body.data)
  console.log(decryptedData)
  let newNews = new News({
    _id: new mongoose.Types.ObjectId(),
    title: decryptedData.title,
    description: decryptedData.description,
    photo: photo,

  })
  newNews.save(function (err) {
    if (!err) {
      Notify.notifiyNews(decryptedData.title, decryptedData.description)
      return res.send(newNews)
    } else {
      console.log(err)
      res.sendStatus(500)
    }
  })


});
app.post('/news/edit/', uploadNews.array('photo', 2), function (req, res) {
  let photo = req.files[0] !== undefined ? req.files[0].filename : ''
  console.log('tttt')
  let decryptedData = decrypt(req.body.data)
  console.log(decryptedData)
  News.findById(decryptedData._id, function (err, data) {
    if (!err) {
      data.title = decryptedData.title,
        (data.description = decryptedData.description)
      if (photo !== '') { data.photo = photo }

    } else {
      console.log(err)
    }
    data.save(function (err) {
      if (!err) {
        console.log('edited')
        return res.send(req.body.data)
      } else {
        console.log(err)
        res.sendStatus(500)
      }
    })
  })



});
app.post('/user/createPurchase', upload.array('photo', 2), function (req, res) {

  let decryptedData = decrypt(req.body.data)
  let addressPhoto = req.files[0] !== undefined ? req.files[0].filename : ''
  let passPhoto = req.files[1] !== undefined ? req.files[1].filename : ''
  Promise.all([DeliveryItem.count({})]).then(result => {
    let newDvItem = new DeliveryItem({
      _id: new mongoose.Types.ObjectId(),
      deliveryItemNumber: result[0],
      userFCs: decryptedData.userFCs,
      userPhone: decryptedData.userPhone,
      userAddres: decryptedData.userAddres,
      addresseeFCs: decryptedData.addresseeFCs,
      addresseePhone: decryptedData.addresseePhone,
      toCountry: decryptedData.toCountry,
      shippingMethod: decryptedData.shippingMethod,
      toCity: decryptedData.toCity,
      weight: decryptedData.weight,
      price: decryptedData.price,
      user: decryptedData.user,
      addressPhoto: addressPhoto,
      passPhoto: passPhoto
    });
    newDvItem.save(function (err) {
      if (!err) {
        console.log('ok');
        return res.send(crypt('500'));

      } else {
        console.log(err);
        res.sendStatus(200);
      }
    });
  })
});
app.post('/user/resetPurchase', function (req, res) {
  let decryptedData = decrypt(req.body.data)

  DeliveryItem.findById(decryptedData.dvId, function (err, dvItem) {
    if (err) {
      console.log(err);
    } else {

      (dvItem.decoratedDate = Date.now()),
        (dvItem.isCompleted = 'inIdle')
    }
    dvItem.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('okkkk');
        return res.send(crypt('500'));
      }
    });
  });

});
app.post('/user/decoratePurchase', upload.array('photo', 2), function (req, res) {
  let decryptedData = decrypt(req.body.data)

  let addressPhoto = req.files[0] !== undefined ? req.files[0].filename : ''
  console.log(req.files[0], 'files0')
  console.log(req.files[1], 'files1')
  let passPhoto = req.files[1] !== undefined ? req.files[1].filename : ''
  DeliveryItem.findById(decryptedData.dvId, function (err, dvItem) {
    if (err) {
      console.log(err);
    } else {
      console.log(dvItem)
      dvItem.userFCs = decryptedData.userFCs,
        dvItem.userPhone = decryptedData.userPhone,
        dvItem.userAddres = decryptedData.userAddres,
        dvItem.addresseeFCs = decryptedData.addresseeFCs,
        dvItem.addresseePhone = decryptedData.addresseePhone,
        dvItem.toCountry = decryptedData.toCountry,
        dvItem.shippingMethod = decryptedData.shippingMethod,
        dvItem.toCity = decryptedData.toCity,
        dvItem.weight = decryptedData.weight,
        dvItem.price = decryptedData.price,

        (dvItem.decoratedDate = Date.now()),
        (dvItem.isCompleted = 'inProcess')
      if (addressPhoto !== '') {
        dvItem.addressPhoto = addressPhoto
      }
      if (passPhoto !== '') {
        dvItem.passPhoto = passPhoto
      }
    }



    dvItem.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('okkkk');
        return res.send(crypt('500'));
      }
    });
  });

});
app.post('/user/reservePurchase', function (req, res) {
  let decryptedData = decrypt(req.body.data)

  DeliveryItem.findById(decryptedData.dvId, function (err, dvItem) {
    if (err) {
      console.log(err);
    }
    (dvItem.employee = decryptedData.employeeId),
      (dvItem.reservatedDate = Date.now()),
      (dvItem.isCompleted = 'reserved');
    dvItem.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('okkkk');
        return res.send(crypt('500'));
      }
    });
  });

});
app.post('/user/delete', function (req, res) {
  let decryptedData = decrypt(req.body.data)
  User.findByIdAndDelete(decryptedData.userId, function (err, data) {
    if (!err) {
      console.log(data)
      res.send(crypt(data))
    } else {
      console.log(err)
      res.send(crypt('500'))
    }
  })

});
app.post('/user/completePurchase', function (req, res) {
  let decryptedData = decrypt(req.body.data)

  DeliveryItem.findById(decryptedData.dvId, function (err, dvItem) {
    if (err) {
      console.log(err);
    }

    (dvItem.completedDate = Date.now()),
      (dvItem.isCompleted = 'completed');
    dvItem.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('okkkk');
        res.send(crypt('500'));
      }
    });
  });

});
app.get('/user/:id', function (req, res) {
  console.log(req.params.id);
  DeliveryItem.find({ user: req.params.id })
    .populate('employee')
    .populate('user')
    .exec(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.send(crypt(data));
      }
    });
});
app.get('/employee/:id', function (req, res) {
  console.log(req.params.id);
  DeliveryItem.find({ employee: req.params.id })
    .populate('employee')
    .populate('user')
    .exec(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.send(crypt(data));
      }
    });
});
app.get('/admin/allreqs/', function (req, res) {
  console.log(req.params.id);

  Promise.all([
    DeliveryItem.find({ isCompleted: 'reserved' })
      .populate('employee')
      .populate('user')
    ,
    DeliveryItem.find({ isCompleted: 'inProcess' })
      .populate('employee')
      .populate('user')
    ,
    DeliveryItem.find({ isCompleted: 'completed' })
      .populate('employee')
      .populate('user')
    ,

  ]).then(result => {
    const [a, b, c] = result
    const reqsData = {
      reserved: a,
      inprocess: b,
      complited: c
    }
    res.send(crypt(reqsData))
  })
});
app.get('/users/', function (req, res) {

  Promise.all([
    User.find({ role: 'user' }),
    User.find({ role: 'employee' }),


  ]).then(result => {
    const [a, b] = result
    const reqsData = {
      users: a,
      employees: b,

    }
    res.send(crypt(reqsData))
  })
});
app.get('/employee/reqs/:id', function (req, res) {
  console.log(req.params.id);

  Promise.all([
    DeliveryItem.find({ employee: req.params.id, isCompleted: 'reserved' })
      .populate('employee')
      .populate('user')
    ,
    DeliveryItem.find({ employee: req.params.id, isCompleted: 'inProcess' })
      .populate('employee')
      .populate('user')
    ,
    DeliveryItem.find({ employee: req.params.id, isCompleted: 'completed' })
      .populate('employee')
      .populate('user')
    ,

  ]).then(result => {
    const [a, b, c] = result
    const reqsData = {
      reserved: a,
      inprocess: b,
      complited: c
    }
    res.send(crypt(reqsData))
  })
});
app.get('/getvacantitems', function (req, res) {
  DeliveryItem.find({ isCompleted: 'inIdle' })

    .populate('user')
    .exec(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.send(crypt(data));
      }
    });
});
app.get('/logout/:id', function (req, res) {
  let token = req.params.id;
  Notify.unsubscribeToTopic(token)
  res.send('500')
})

app.get('/noti', function (req, res) {
  let title = 'TITLE'
  let body = 'NEW NEWS'
  Notify.notifiyNews(title, body)
})
// app.get('/lg', function (req, res) {

//   Notify.unsubscribeToTopic('cPu3DrIfPig:APA91bGpI5FPYTQj1jUfOpFfhT45scVR008zfDit9LV1CpCctbB3SMZyG3TPmC3F9x67P1y884Vu5WsR5O7FH4gNF2N08GE4uqgtXcovhbvJTzWCnTIjtTFAaQAaRWjpaGaLIzn_WfKx'
//     , 'ds')
// })
app.get('/pur', function (req, res) {
  let title = 'TITLE'
  let body = 'PURCHASE'
  Notify.PurchaseNotify(title, body)
})
///dasdasds



const uri =
  'mongodb+srv://madeagle:nokia0000@cluster0-gbd7h.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true }, function (err, database) {
  if (err) {
    return console.log(err);
  }
  db = database;
  app.listen(process.env.PORT || 3003, function () {
    console.log('server started');
  });
  console.log('connected ' + database);
});