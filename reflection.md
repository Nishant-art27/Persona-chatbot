# Reflection

## What Worked Well

The most impactful decision was investing heavily in persona research before writing a single line of prompt. I spent time watching Anshuman Singh's podcast appearances (Raj Shamani's "Figuring Out," Startup Grind talks), reading Abhimanyu Saxena's YourStory interviews and ASU+GSV summit discussions, and going through Quora reviews and Scaler forum posts about Kshitij Mishra's teaching style. This research surfaced specific details — Anshuman's natural Hindi phrases, Abhimanyu's "compass vs. map" metaphor, Kshitij's encouraging "Arre, don't worry!" — that made the personas feel genuinely authentic rather than generically helpful.

The few-shot examples proved to be the single most powerful lever for persona quality. Without them, the model would often produce responses that were technically correct but tonally indistinguishable between personas. With carefully crafted examples that demonstrated each persona's unique sentence structure, vocabulary, and emotional register, the differentiation became immediately noticeable. Three examples per persona hit the sweet spot — enough to establish a pattern without bloating the context window.

The chain-of-thought instruction was a subtle but important addition. By telling the model to "internally reason through: What is the user really asking? What personal experience is most relevant?" before responding, the answers became noticeably more thoughtful and contextually relevant, even though the reasoning itself is never shown to the user.

## What GIGO Taught Me

The Garbage In, Garbage Out principle was viscerally real during prompt development. My first draft of Anshuman's prompt was a lazy two-liner: "You are Anshuman Singh, co-founder of Scaler. Be helpful and motivating." The model's output was indistinguishable from a generic career advisor. It could have been anyone. The moment I replaced that with specific biographical details, communication style notes, and concrete few-shot examples, the output quality transformed dramatically. The same model, the same API call — the only variable was the quality of my input. GIGO isn't just a principle; it's a multiplier. Every hour spent improving the prompt saved hours of trying to work around a mediocre one.

## What I Would Improve

If I had more time, I would add multi-turn awareness to the system prompts — instructions for how the persona should handle follow-up questions, reference earlier points in the conversation, and build rapport over multiple exchanges. Currently, each response is somewhat standalone. I would also add support for streaming responses (using the Gemini streaming API) to reduce perceived latency and create a more natural chat experience. Finally, I'd love to add voice output using a TTS API to truly bring these personas to life — imagine hearing Anshuman's directness or Kshitij's encouraging tone.
