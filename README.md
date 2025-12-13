# Tips

- Fit mobile viewport

```jsx
<div className="flex flex-col h-dvh">
  <div>...</div>
  <div className="overflow-y-auto grow"></div>
</div>
```

- Update bets, wins, earns based on aggregate

```js
db.getCollection("bets")
  .aggregate([
    {
      $lookup: {
        from: "lines",
        localField: "lineId",
        foreignField: "_id",
        as: "lineInfo",
      },
    },
    {
      $unwind: {
        path: "$lineInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$username",
        bets: { $sum: 1 },
        wins: {
          $sum: {
            $cond: [{ $eq: ["$status", "win"] }, 1, 0],
          },
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
                          "$lineInfo.no",
                        ],
                      },
                      1,
                    ],
                  },
                ],
              },
              0,
            ],
          },
        },
      },
    },
  ])
  .forEach(function (result) {
    db.getCollection("users").updateOne(
      { username: result._id }, // Find the user by username
      { $set: { bets: result.bets, wins: result.wins } } // Update their bets and wins
    );
  });
```

- Simplify lines(Remove unused lines)

```js
let betIds = db.getCollection("bets").distinct("lineId");
db.getCollection("lines").deleteMany({
  _id: { $nin: betIds },
  result: { $ne: "pending" },
});
```

- Query valid lines only

```js
db.getCollection("lines").aggregate([
  {
    $group: {
      _id: "$sports",
      count: {
        $sum: {
          $cond: [
            {
              $or: [
                // { $not: { $in: ["$odds_regular", [null, undefined]] } },
                // { $not: { $in: ["$odds_corners", [null, undefined]] } },
                // { $not: { $in: ["$odds_sets", [null, undefined]] } },
                // { $not: { $in: ["$odds_games", [null, undefined]] } },
                // { $not: { $in: ["$odds_points", [null, undefined]] } },
                // { $not: { $in: ["$odds_bookings", [null, undefined]] } },
                // { $not: { $in: ["$odds_daily_total", [null, undefined]] } },
                { $eq: [{ $type: "$odds_regular" }, "string"] },
                { $eq: [{ $type: "$odds_corners" }, "string"] },
                { $eq: [{ $type: "$odds_sets" }, "string"] },
                { $eq: [{ $type: "$odds_games" }, "string"] },
                { $eq: [{ $type: "$odds_points" }, "string"] },
                { $eq: [{ $type: "$odds_bookings" }, "string"] },
                { $eq: [{ $type: "$odds_daily_total" }, "string"] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
  },
]);
```
