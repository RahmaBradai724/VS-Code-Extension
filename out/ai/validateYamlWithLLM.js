"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateYamlWithLLM = validateYamlWithLLM;
/**
 * Uses an LLM to validate a YAML configuration, analyze errors, and suggest corrections.
 * @param yamlContent The YAML string to validate.
 * @param ollama An instance of OllamaClient.
 * @param onChunk Callback for streaming LLM output.
 * @param abortSignal Optional abort signal.
 * @returns The full LLM response as a string.
 */
async function validateYamlWithLLM(yamlContent, ollama, onChunk, abortSignal) {
    const systemPrompt = `
You are an expert YAML configuration validator. 
Given the following YAML content, analyze it for errors, inconsistencies, and best practices. 
- List all detected errors and explain them.
- Suggest specific corrections or improvements.
- If the YAML is valid, confirm its correctness.
- Output your suggestions in a clear, actionable format.
`;
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: yamlContent }
    ];
    // Stream the LLM's response
    const response = await ollama.chat(messages, onChunk, abortSignal);
    return response;
}
//# sourceMappingURL=validateYamlWithLLM.js.map