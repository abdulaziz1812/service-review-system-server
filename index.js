require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://service-review-system-a5c49.web.app",
      "https://service-review-system-a5c49.firebaseapp.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());



const verifyToken = (req, res, next) => {
 
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bfe0u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    // Auth related APIs

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // services api
    const servicesCollection = client
      .db("serviceReviewSystem")
      .collection("services");
    const reviewCollection = client
      .db("serviceReviewSystem")
      .collection("review");
    const userCollection = client.db("serviceReviewSystem").collection("users");

    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services-featured", async (req, res) => {
      const cursor = servicesCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/service-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    });

    app.get("/my-services", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedService = req.body;
      const service = {
        $set: {
          serviceImage: updatedService.serviceImage,
          serviceTitle: updatedService.serviceTitle,
          companyName: updatedService.companyName,
          website: updatedService.website,
          description: updatedService.description,
          category: updatedService.category,
          price: updatedService.price,
          addedDate: updatedService.addedDate,
          email: updatedService.email,
        },
      };
      const result = await servicesCollection.updateOne(
        filter,
        service,
        options
      );
      res.send(result);
    });

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    });

    // review api

    app.post("/review", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    app.get("/review-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { serviceId: id };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/my-reviews", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await reviewCollection.find(query).toArray();

      for (const review of result) {
        const query1 = { _id: new ObjectId(review.serviceId) };
        const service = await servicesCollection.findOne(query1);
        if (service) {
          review.serviceTitle = service.serviceTitle;
          review.serviceImage = service.serviceImage;
          review.companyName = service.companyName;
        }
      }

      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedReview = req.body;
      const review = {
        $set: {
          text: updatedReview.text,
          date: updatedReview.date,
          rating: updatedReview.rating,
        },
      };
      const result = await reviewCollection.updateOne(filter, review, options);
      res.send(result);
    });

    // user api
    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // Countup api

    app.get("/counts", async (req, res) => {
      const serviceCount = await servicesCollection.countDocuments();
      const reviewCount = await reviewCollection.countDocuments();
      const userCount = await userCollection.countDocuments();
      res.send({ serviceCount, reviewCount, userCount });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Service Review System sever is running");
});

app.listen(port, () => {
  console.log(`Server is running at: ${port}`);
});
