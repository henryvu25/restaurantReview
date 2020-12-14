require('dotenv').config();
const express = require("express"); 
const cors = require("cors");
const db = require("./db"); //will automatically look for index.js

const app = express();

app.use(cors());
app.use(express.json()); //this is a middleware that allows req.body to work. it takes the body of the request and gives it to us in json format

//GET ALL RESTAURANTS
app.get("/api/v1/restaurants", async (req, res) => {
    try {
        //const results = await db.query("SELECT * FROM restaurants;")
        
        const restaurantRatingsData = await db.query(
            "select * from restaurants left join (select restaurant_id, count(*) as review_count, trunc(avg(rating), 1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;"
        );
 

        res.status(200).json({
            status: "success",
            results: restaurantRatingsData.rows.length,
            data: {
                restaurants: restaurantRatingsData.rows
            }
        });
    } catch (err) {
        console.error(err.message);
    }
});

//GET ONE RESTAURANT
app.get("/api/v1/restaurants/:id", async (req, res) => {
    try {
        const restaurant = await db.query("select * from restaurants left join (select restaurant_id, count(*) as review_count, trunc(avg(rating), 1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id = $1;", [req.params.id])
        
        const reviews = await db.query("SELECT * FROM reviews WHERE restaurant_id = $1", [req.params.id])
        res.status(200).json({
            status: "success",
            data: {
                restaurant: restaurant.rows[0],
                reviews: reviews.rows
            }
        })
    } catch (err) {
        console.error(err.message);
    }
});

//CREATE A RESTAURANT
app.post("/api/v1/restaurants", async (req, res) => {
    try {
        const body = req.body;
        const result = await db.query("INSERT INTO restaurants (name, location, price_range) VALUES ($1, $2, $3) RETURNING *", [body.name, body.location, body.price_range])

        res.status(201).json({
            status: "success",
            data: {
                addedRestaurant: result.rows[0]
            }
        })
    } catch (err) {
        console.error(err.message);
    }
});

//UPDATE A RESTAURANT
app.put("/api/v1/restaurants/:id", async (req, res) => {
    try {
        const body = req.body;
        const result = await db.query("UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE id = $4 RETURNING *", [body.name, body.location, body.price_range, req.params.id])
       
        res.status(200).json({
            status: "success",
            data: {
                restaurant: result.rows[0]
            }
        })
    } catch (err) {
        console.error(err.message);
    }
})

//DELETE A RESTAURANT
app.delete("/api/v1/restaurants/:id", async (req, res) => {
    try {
        const result = await db.query("DELETE from restaurants WHERE id = $1 RETURNING *", [req.params.id]);
        
        res.status(200).json({
            status: "success",
            data: {
                deleted: result.rows[0]
            }
        });
    } catch (err) {
        console.error(err.message);
    }
})

app.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
    try {
        const body = req.body;
        const result = await db.query("INSERT INTO reviews (restaurant_id, name, review, rating) VALUES ($1, $2, $3, $4) RETURNING *", [req.params.id, body.name, body.review, body.rating])
        console.log(result)
        res.status(201).json({
            status: "success",
            data: {
                review: result.rows[0]
            }
        })
    } catch (err) {
        console.error(err.message)
    }
})

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
}); 