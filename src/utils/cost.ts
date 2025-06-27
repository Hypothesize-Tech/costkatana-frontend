export interface CostCalculationResult {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    totalCost: number;
}

export const calculateCost = (
    _service: string,
    _model: string,
    _input: string,
    _output: string
): CostCalculationResult => {
    return {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
    };
}; 