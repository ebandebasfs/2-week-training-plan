# Week 1 Summary

One sentence per day, plus a closing paragraph on what SQL fundamentals clicked.

- **Day 1 (Mon)**
Took 4 baseline assessments and scaffolded api.queue_booking with TypeORM and wrote seeder in preparation for
the succeeding training plan days.

- **Day 2 (Tue)**
Studied the concept of JS Event loop, async + await, promises and microtask vs macrotask, added annotation/comments each function and provided answer to the question "Why these concepts suprises developers?"

- **Day 3 (Wed)**
Dug deeper into the JS runtime validation, closures, this keyword, wrote function isolated demo for each of the concept, provided video demo explaining each concepts and created a PR.

- **Day 4 (Thu)**
Generated a broken-report exercise and assessed my baseline SQL knowledge, answered 3 lab exercises with
COUNT aggregate function, pointed out why COUNT only counts non-NULL values and provided video demo.

- **Day 5 (Fri)**
Diffed INNER/LEFT/RIGHT row counts to see how FK constraints make RIGHT degrade to INNER, and rewrote a subquery as a JOIN, learning DISTINCT dedupes whole output rows, not a column, provided SQL fundamentals learnings and provided a video demo.  

## What clicked

Learning joins and subqueries is mildly complex but once I got the syntax
its actually easy. Knowing how to use a type of join is also important
because joins combine related data across tables. Subquieries are special
because it lets me perform a query on a temporary table or output of a query
which makes it also powerful for much more complex data fetching or logging.
