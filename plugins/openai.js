global.aiToxicThreshold = -0.355;
global.contentFilterCheck = res => {
    let label = res.choices[0].text;

    if (label === "2") {
        let logprobs = res.choices[0].logprobs.top_logprobs[0];

        if (logprobs["2"] < aiToxicThreshold) {
            let lp0 = logprobs["0"];
            let lp1 = logprobs["1"];

            if (lp0 !== undefined && lp1 !== undefined) {
                if (lp0 >= lp1) label = "0";
                else label = "1";
            } else if (lp0 !== undefined) label = "0";
            else if (lp1 !== undefined) label = "1";
        }
    }

    if (label < 0 || label > 2) label = "2"; // So glad strings can act like numbers :^)

    return label;
}