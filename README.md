# Tips
- Update bets, wins, earns based on aggregate
```js

db.getCollection("bets").aggregate([
    {
        $lookup: {
            from: "lines",
            localField: "lineId",
            foreignField: "_id",
            as: "lineInfo"
        }
    },
    {
        $unwind: {
            path: "$lineInfo",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $group: {
            _id: "$username",
            bets: { $sum: 1 },
            wins: {
                $sum: {
                    $cond: [{ $eq: ["$status", "win"] }, 1, 0]
                }
            },
            earns: {
                $sum: {
                    $cond: [
                        { $eq: ["$status", "win"] },
                        {
                            $multiply: [
                                "$amount",
                                {
                                    $subtract: [
                                        {
                                            $cond: [
                                                { $eq: ["$lineInfo.result", "yes"] },
                                                "$lineInfo.yes",
                                                "$lineInfo.no"
                                            ]
                                        },
                                        1
                                    ]
                                }
                            ]
                        },
                        0
                    ]
                }
            },
        }
    },
])
.forEach(function(result) {
    db.getCollection("users").updateOne(
        { username: result._id }, // Find the user by username
        { $set: { bets: result.bets, wins: result.wins } } // Update their bets and wins
    );
})
```