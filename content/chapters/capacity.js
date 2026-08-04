/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["capacity"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "A Fabric SKU number is a rate. An F2 supplies 2 [[capacity-unit|capacity units]] every second — not two units to spend, but two per second, forever. Almost every confusing thing about capacity comes from reading a tap as a tank."
    },
    {
      "d": 1,
      "t": "p",
      "x": "Demand is not a rate. It arrives in bursts: a refresh, a notebook, forty people opening a report at 09:00. So the platform needs a way to serve a spike from a steady supply, and that is the whole design."
    },
    {
      "d": 2,
      "t": "h",
      "x": "Three names, one mechanism"
    },
    {
      "d": 2,
      "t": "list",
      "items": [
        "[[bursting|Bursting]] lets an operation consume faster than the sustained rate, so it finishes sooner.",
        "[[smoothing|Smoothing]] then spreads what it consumed across later timepoints, so the spike is repaid over time.",
        "[[throttling|Throttling]] is what happens when the repayment schedule has borrowed too far into the future."
      ]
    },
    {
      "d": 2,
      "t": "p",
      "x": "Bursting without smoothing would be free money. Smoothing without bursting would be pointless. Throttling is the debt ceiling. Once you see it as borrow-and-repay, the numbers stop being arbitrary."
    },
    {
      "d": 3,
      "t": "figure",
      "fig": "smoothing",
      "caption": "Drag the burst. Watch it get spread across the smoothing window and, when it is large enough, push future timepoints over the line into each throttling stage."
    },
    {
      "d": 2,
      "t": "h",
      "x": "The clock"
    },
    {
      "d": 2,
      "t": "p",
      "x": "Consumption is evaluated in 30-second timepoints — 2,880 of them in a day. Background operations are smoothed across the full 24 hours. Interactive operations are smoothed over a shorter window: a minimum of 5 minutes, up to 64."
    },
    {
      "d": 2,
      "t": "p",
      "x": "The asymmetry is deliberate. Someone is waiting for the interactive one."
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "Why smooth background work over 24 hours but interactive work over minutes?",
      "a": "Smoothing is about billing, not scheduling — but a long window on interactive work would let a single spike suppress a whole day of responsiveness. The window length encodes who is waiting.",
      "concept": "smoothing"
    },
    {
      "d": 3,
      "t": "h",
      "x": "Degradation in stages"
    },
    {
      "d": 3,
      "t": "list",
      "items": [
        "Up to 10 minutes of future capacity borrowed: nothing happens.",
        "Between 10 and 60 minutes: new interactive requests are delayed by 20 seconds.",
        "Between 60 minutes and 24 hours: interactive requests are rejected.",
        "Beyond 24 hours: background requests are rejected too."
      ]
    },
    {
      "d": 3,
      "t": "p",
      "x": "This is [[progressive-degradation]] written as a table. The 20-second delay is the interesting stage: it is not a punishment, it is a signal, arriving while there is still time to act. A limit that is invisible until it is fatal teaches nobody anything."
    },
    {
      "d": 3,
      "t": "p",
      "x": "And it is [[utilization]] all over again. The queueing curve says delay climbs non-linearly as you approach full utilisation; the throttling table is that curve, discretised into four stages with names."
    },
    {
      "d": 4,
      "t": "h",
      "x": "The exceptions worth remembering"
    },
    {
      "d": 4,
      "t": "list",
      "items": [
        "Overage consumed beyond the capacity is billed at 3× the standard rate.",
        "Under Autoscale Billing for Spark, bursting and smoothing do not apply at all — Spark jobs are billed as consumed.",
        "Trial capacities do not throttle; they simply stop."
      ]
    },
    {
      "d": 4,
      "t": "p",
      "x": "The Autoscale exception is the one that catches people, because it silently removes the mechanism they have built their intuition around. When a billing mode changes, check whether it also changed the physics."
    },
    {
      "d": 4,
      "t": "prompt",
      "q": "Your capacity has borrowed 45 minutes of future compute. What does a user see?",
      "a": "A roughly 20-second delay on new interactive requests. Nothing is rejected yet — that starts past 60 minutes. This is the stage where the signal is still cheap.",
      "concept": "throttling"
    }
  ],
  "sources": [
    {
      "label": "Understand your Fabric capacity throttling",
      "url": "https://learn.microsoft.com/en-us/fabric/enterprise/throttling",
      "note": "The throttling stages, the 30-second timepoint, and the smoothing windows."
    },
    {
      "label": "Smoothing and throttling in Fabric Data Warehousing",
      "url": "https://learn.microsoft.com/en-us/fabric/data-warehouse/compute-capacity-smoothing-throttling"
    },
    {
      "label": "Microsoft Fabric concepts and licenses",
      "url": "https://learn.microsoft.com/en-us/fabric/enterprise/licenses",
      "note": "Where “the SKU number is CU per second” is stated."
    },
    {
      "label": "Autoscale Billing for Spark",
      "url": "https://learn.microsoft.com/en-us/fabric/data-engineering/autoscale-billing-for-spark-overview",
      "note": "The exception: bursting and smoothing do not apply."
    }
  ]
};
