/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["bottleneck"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "Wait time does not rise in proportion to load. It rises as ρ/(1−ρ). At 50% [[utilization]] you wait about one service time. At 90%, nine. At 99%, ninety-nine."
    },
    {
      "d": 1,
      "t": "p",
      "x": "A system at 85% is not “a bit busier” than one at 70%. It is on a different part of a curve that turns vertical."
    },
    {
      "d": 2,
      "t": "figure",
      "fig": "queue",
      "caption": "Drag the utilization. The curve is the whole lesson: the flat region is where planning happens, and the wall is where incidents happen."
    },
    {
      "d": 2,
      "t": "p",
      "x": "The reason is variance. Arrivals are not evenly spaced and service times are not identical. A resource with spare capacity absorbs that variance; a saturated one has nowhere to put it, so arrivals begin waiting for other arrivals."
    },
    {
      "d": 2,
      "t": "p",
      "x": "Which means [[slack]] is not waste. Variance has to go somewhere: into spare capacity, into queues, or into failures. Removing slack relocates it, it does not remove it."
    },
    {
      "d": 3,
      "t": "h",
      "x": "Little’s law as an elimination tool"
    },
    {
      "d": 3,
      "t": "p",
      "x": "[[littles-law|L = λW]] holds for any stable system, with no assumptions about distributions. Its real use is negative: pick a target throughput and a target latency and it tells you the concurrency you must sustain. If that number is impossible, one of the two targets was fiction — and you know that before building anything."
    },
    {
      "d": 3,
      "t": "prompt",
      "q": "A service must handle 2,000 requests per second at 50 ms. How many must be in flight at once?",
      "a": "L = λW = 2000 × 0.05 = 100 concurrent requests. If the pool caps at 40, the latency target was never reachable.",
      "concept": "littles-law"
    },
    {
      "d": 3,
      "t": "p",
      "x": "And then [[tail-latency]] multiplies it. A request that fans out to 100 services, each with a 1% slow path, is slow about 63% of the time. At scale the tail is not an outlier; it is the median experience."
    },
    {
      "d": 4,
      "t": "p",
      "x": "The M/M/1 formula above assumes Poisson arrivals and exponential service. Real systems are usually worse, not better, because real arrivals are bursty. Treat the curve as an optimistic bound and the intuition survives."
    }
  ],
  "sources": [
    {
      "label": "John D. C. Little, “Little’s Law as Viewed on Its 50th Anniversary”, Operations Research 59(3), 2011",
      "note": "The author’s own account of what the law does and does not assume."
    },
    {
      "label": "Brendan Gregg — The USE Method",
      "url": "https://www.brendangregg.com/usemethod.html",
      "note": "Utilisation, saturation, errors: the practical companion to the curve."
    },
    {
      "label": "Dean & Barroso, “The Tail at Scale”, Communications of the ACM 56(2), 2013",
      "note": "Source of the fan-out argument in the depth-3 section."
    }
  ]
};
