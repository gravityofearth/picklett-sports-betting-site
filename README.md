# Tips
- Update wins and bets based on aggregate
```js
db.getCollection("bets").aggregate([
    {
        $group: {
            _id: "$username",
            bets: { $sum: 1 },
            statuses: { $push: "$status" }
        }
    },
    {
        $addFields: {
            wins: {
                $size: {
                    $filter: {
                        input: "$statuses",
                        cond: { $eq: ["$$this", "win"] }
                    }
                }
            }
        }
    },
]).forEach(function(result) {
    db.getCollection("users").updateOne(
        { username: result._id }, // Find the user by username
        { $set: { bets: result.bets, wins: result.wins } } // Update their bets and wins
    );
})
```