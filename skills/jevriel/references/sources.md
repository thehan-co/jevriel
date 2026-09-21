# Sources and evidence boundary

Research checked 2026-09-21. TypeSafe Jev only. Refresh API, pricing and model contracts before a live integration.

## Primary technical sources

- [TypeSafe introduction](https://docs.typesafe.ai/introduction): model role and typed decisions.
- [API contract](https://docs.typesafe.ai/api): native requests and responses.
- [Build guidance](https://docs.typesafe.ai/concepts/how-to-build-with-system-one): independent questions, criteria and composition.
- [Confidence](https://docs.typesafe.ai/confidence): distributions and confidence have different meanings.
- [Models](https://docs.typesafe.ai/models): current versions, input limits, rate limits and pricing.
- [Known weaknesses](https://docs.typesafe.ai/model-jaggedness/jev-1.13): literal reading, arithmetic, dates, indirection, distraction, adversarial content and generation limits.
- [TypeSafe launch](https://typesafe.ai/blog/introducing-system-one-models-and-jev): vendor positioning and vendor-selected benchmark claims. Do not turn headline ratios into expected user savings.
- [LangChain integration](https://www.langchain.com/blog/building-a-harness-with-jev): an integration author's account of harness/model-routing use. Verify package APIs before copying examples.

## Public discussion and external measurements

- [Context7, X, 18 September](https://x.com/Context7AI/status/2101009668655272243): author-reported comparison across five classification tasks, with mixed quality outcomes. Useful motivation for task-specific evaluation; not independently reproduced here. Public post text retrieved through the FxTwitter mirror because direct X returned 403.
- [Armin Ronacher, X, 17 September](https://x.com/mitsuhiko/status/2100470099622633861): hands-on enthusiasm for applications constrained by cost or speed. An opinion, not a controlled result. Same mirror access.
- [Diogo Almeida launch post, X, 15 September](https://x.com/CompleteSkeptic/status/2099925682726002904): primary vendor announcement, same mirror access.
- [LocalLLaMA discussion](https://www.reddit.com/r/LocalLLaMA/comments/1wje4xh/still_doesnt_get_what_jev_isis_it_just_a_more/): debate about generalized classification and prior art. Read on 21 September; page-relative dates were inconsistent, so no exact posting date is asserted here. Architecture speculation is not a technical fact.
- [Reddit launch discussion, 19 September](https://www.reddit.com/r/machinelearningnews/comments/1wku8qn/typesafe_ai_releases_jev_a_system_one_model_that/): readers ask for broader evaluation. No benchmark conclusion is drawn from votes or comments.
- [ASSAY-001](https://github.com/jourdanlabs/assay-001): an independent author's published protocol and raw-result repository reports different calibration outcomes on two datasets. Inspected its report and scope; not independently rerun for JEVRIEL. This is a reason to measure calibration locally, not evidence for a universal accuracy claim.
- [Official Python SDK issue #2](https://github.com/typesafe-ai/typesafe-sdk-python/issues/2): a reported quickstart-output mismatch. An example output in documentation is not an expected test oracle.
- [Syntax: Jev Explained, Demos and Use Cases](https://www.youtube.com/watch?v=QbYBRjOaGOo), 17 September: verified page description and chapter metadata discuss classification, code review, summary checks and routing. Chapter pointers: 06:11 classification, 09:45 code review, 10:14 summary checks, 11:26 routing. Full captions were unavailable during this research; do not present this as a watched/transcribed review. [Author's demo code](https://github.com/w3cj/jev-chat).
- [WorldofAI browser-use video](https://www.youtube.com/watch?v=SNJ3yuJ_QwY): title/page discovery only. The headline is not a reproduced speed result.

## Kahneman

[Thinking, Fast and Slow, publisher description](https://www.penguinrandomhouse.com/books/89308/thinking-fast-and-slow-by-daniel-kahneman/) supports the fast/intuitive and deliberate/effortful distinction, including the possibility of bias. JEVRIEL uses it as an engineering analogy. The judgment that the book is one of the most important ever written is Han's personal view.

[Han's supplied System 1/System 2 explainer](https://www.youtube.com/watch?v=QsIosth_zeY): La Travesía, 15 April 2025. Page description inspected; caption body unavailable. Use the book/publisher for attribution, not unverified video quotations.

## Benchmark price basis

[TypeSafe's published model listing](https://docs.typesafe.ai/models), checked 21 September 2026: Jev 1.13 is $0.042 per million input tokens; output tokens are free. JEVRIEL's launch evaluation applies that published rate to reported usage, as a list-price estimate. The test ran through a gateway alias, so this is not an account invoice or a measurement of gateway billing. Provider promotions do not set the benchmark's price basis.

## Evidence discipline

The supplied AI-generated analysis PDF is background, not authoritative documentation. Its Java-specific digression is outside scope, and its high-confidence-as-immutable-fact guidance is rejected. Internal experiments inform the author's story but private raw material is not distributed with this skill. Claims must distinguish vendor report, third-party self-report, independently reproducible result, current local measurement and hypothesis.
