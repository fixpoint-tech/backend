import { computeDataDrivenAHP } from "../utils/pairwiseMatrix.js";

export const dataDrivenAHP = (req, res) => {
  const { criteriaNames, alternativeNames, dataMatrix, benefitFlags } = req.body || {};

  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required. Please send JSON with dataMatrix, criteriaNames, alternativeNames, and benefitFlags.' });
  }

  if (!Array.isArray(dataMatrix)) {
    return res.status(400).json({ error: 'dataMatrix must be an array.' });
  }

  try {
    console.log("Start running AHP computation");
    
    const ahpResults = computeDataDrivenAHP({
      dataMatrix,
      criteriaNames,
      alternativeNames,
      benefitFlags
    });

    res.status(200).json(ahpResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
