const Claim = require('../models/claim')
const Agency = require('../models/agency')
const InvolvedPolicy = require('../models/involvedPolicy')
const InvolvedCars = require('../models/involvedCar')
const InvolvedParties = require('../models/involvedParty')
const AffectedCoverages = require('../models/affectedCoverage')
const Coverage = require('../models/coverage')
const isNumber = require('../utils/isNumber')
const isBoolean = require('../utils/isBoolean')

exports.CreateClaim = async (req, res) => {
  const {
    claimNumber,
    occurrenceDate,
    reportingDate,
    reportingType,
    responsability,
    damageType,
    claimAmount,
    recourseAmount,
    daaq,
    status,
    flagFraud,
    reportingAgency,
    inspectionMissions,
    involvedCars,
    involvedPolicies,
    affectedCoverages,
    involvedParties,
  } = req.body

  try {
    let errors = []
    if (isNaN(Date.parse(occurrenceDate)))
      errors.push('Occurrence Date is invalid or not provided')

    if (isNaN(Date.parse(reportingDate)))
      errors.push('Reporting Date is invalid or not provided')

    if (!reportingType) errors.push('Reporting Type is not provided')

    if (!responsability) errors.push('Responsibility is not provided')

    if (!damageType) errors.push('Damage Type is not provided')

    if (isNaN(claimAmount) || claimAmount < 0)
      errors.push('Claim Amount is invalid or not provided')

    if (!reportingAgency) errors.push('Reporting Agency is not provided')

    if (!isNumber(recourseAmount))
      errors.push('Invalid Recourse Amount value type')

    if (!isBoolean(flagFraud)) errors.push('Flag Fraud must be a boolean')

    if (new Date(occurrenceDate) >= new Date(reportingDate))
      errors.push('Occurrence date after reporting date')

    const reportingTypeType = Claim.schema.path('reportingType').enumValues
    const responsabilityType = Claim.schema.path('responsability').enumValues
    const damageTypeType = Claim.schema.path('damageType').enumValues
    const statusType = Claim.schema.path('status').enumValues
    if (!reportingTypeType.includes(reportingType))
      errors.push(
        `Reporting Type should be one of this options ${reportingTypeType}`,
      )

    if (!responsabilityType.includes(responsability))
      errors.push(
        `responsability should be one of this options ${responsabilityType}`,
      )

    if (!damageTypeType.includes(damageType))
      errors.push(`Damage Type should be one of this options ${damageTypeType}`)
    if (!statusType.includes(status))
      errors.push(`Status should be one ${statusType}`)

    const dbChecks = []

    if (claimNumber) {
      dbChecks.push(
        Claim.findOne({ claimNumber }).then((existingClaim) =>
          existingClaim ? 'claimNumber already exists.' : null,
        ),
      )
    }

    if (reportingAgency) {
      dbChecks.push(
        Agency.findById(reportingAgency).then((existingAgency) =>
          existingAgency ? null : `Agency Object ${reportingAgency} not found.`,
        ),
      )
    }

    const checkInvolvedEntities = (model, ids, entityName) =>
      ids.map((id) =>
        model
          .findById(id)
          .then((entity) =>
            entity ? null : `${entityName} Object _id ${id} not found.`,
          ),
      )

    dbChecks.push(
      ...checkInvolvedEntities(
        InvolvedPolicy,
        involvedPolicies,
        'Involved Policy',
      ),
      ...checkInvolvedEntities(InvolvedCars, involvedCars, 'Involved Car'),
      ...checkInvolvedEntities(
        InvolvedParties,
        involvedParties,
        'Involved Party',
      ),
      ...checkInvolvedEntities(
        AffectedCoverages,
        affectedCoverages,
        'Affected Coverage',
      ),
    )

    // Execute all checks in parallel
    const checkResults = await Promise.all(dbChecks)
    errors = errors.concat(checkResults.filter((result) => result !== null))

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    const claim = await Claim.create({
      claimNumber,
      occurrenceDate,
      reportingDate,
      reportingType,
      responsability,
      damageType,
      claimAmount,
      recourseAmount,
      daaq,
      status,
      flagFraud,
      reportingAgency,
      inspectionMissions,
      involvedCars,
      involvedPolicies,
      affectedCoverages,
      involvedParties,
    })

    res.status(201).json(claim)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}

exports.GetClaimDetails = async (req, res) => {
  const claimNumber = req.params.claimId
  try {
    if (!claimNumber) {
      return res.status(400).json({ error: 'Claim Number is required.' })
    }

    const AllClaim = await Claim.find({ claimNumber })
      .populate('reportingAgency involvedParties involvedCars involvedPolicies')
      .populate({
        path: 'affectedCoverages',
        populate: {
          path: 'coverage',
          model: 'coverage',
        },
      })

    res.status(200).json(AllClaim)
  } catch (error) {
    console.error(error)
    res.status(500).json({error: error.message })
  }
}

exports.UpdateStatus = async (req, res) => {
  const claimId = req.params.claimId
  const { status } = req.body

  try {
    if (!claimId)  return res.status(400).json({ error: 'Claim Number is required.' })

    if (!Claim.schema.path('status').enumValues.includes(status)) {
      return res
        .status(400)
        .json({ error: 'Status should be one of these options ' + Claim.schema.path('status').enumValues})
    }

    const updateStatusClaim = await Claim.findOneAndUpdate(
      { claimNumber: claimId },
      { $set: { status } },
      { new: true },
    )

    if (!updateStatusClaim) return res.status(404).json({ error: 'Claim ' + claimId + ' not found' })


    res.status(200).json({ success: true, updateStatusClaim })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message })
  }
}

exports.UpdateClaim = async (req, res) => {
  const { claimId } = req.params
  const updatedClaimDetails = req.body

  try {
    let errors = []

    if (
      updatedClaimDetails.occurrenceDate &&
      isNaN(Date.parse(updatedClaimDetails.occurrenceDate))
    )
      errors.push('Occurrence Date is invalid')
    if (
      updatedClaimDetails.reportingDate &&
      isNaN(Date.parse(updatedClaimDetails.reportingDate))
    )
      errors.push('Reporting Date is invalid')
    if (
      updatedClaimDetails.claimAmount &&
      (isNaN(updatedClaimDetails.claimAmount) ||
        updatedClaimDetails.claimAmount < 0)
    )
      errors.push('Claim Amount is invalid')
    if (
      updatedClaimDetails.recourseAmount &&
      !isNumber(updatedClaimDetails.recourseAmount)
    )
      errors.push('Invalid Recourse Amount value type')
    if (
      updatedClaimDetails.flagFraud &&
      !isBoolean(updatedClaimDetails.flagFraud)
    )
      errors.push('Flag Fraud must be a boolean')
    if (
      updatedClaimDetails.occurrenceDate &&
      updatedClaimDetails.reportingDate &&
      new Date(updatedClaimDetails.occurrenceDate) >=
        new Date(updatedClaimDetails.reportingDate)
    )
      errors.push('Occurrence date after reporting date')

    const reportingTypeType = Claim.schema.path('reportingType').enumValues
    const responsabilityType = Claim.schema.path('responsability').enumValues
    const damageTypeType = Claim.schema.path('damageType').enumValues

    if (
      updatedClaimDetails.reportingType &&
      !reportingTypeType.includes(updatedClaimDetails.reportingType)
    )
      errors.push(
        `Reporting Type should be one of this options ${reportingTypeType}`,
      )
    if (
      updatedClaimDetails.responsability &&
      !responsabilityType.includes(updatedClaimDetails.responsability)
    )
      errors.push(
        `responsibility should be one of this options ${responsabilityType}`,
      )
    if (
      updatedClaimDetails.damageType &&
      !damageTypeType.includes(updatedClaimDetails.damageType)
    )
      errors.push(`Damage Type should be one of this options ${damageTypeType}`)

    const dbChecks = []

    const existingClaim = await Claim.findOne({ claimNumber: claimId })
    if (!existingClaim) dbChecks.push('Claim ${claimId} not found')

    const checkInvolvedEntities = (model, ids, entityName, existingEntities) =>
      ids.map(async (id) => {
        const entity = await model.findById(id)
        if (!entity) {
          return `${entityName} Object _id ${id} not found.`
        }
        if (existingEntities.includes(id)) {
          return `${entityName} Object _id ${id} is already associated with this claim.`
        }
      })

    dbChecks.push(
      ...(await checkInvolvedEntities(
        InvolvedPolicy,
        updatedClaimDetails.involvedPolicies || [],
        'Involved Policy',
        existingClaim.involvedPolicies,
      )),
      ...(await checkInvolvedEntities(
        InvolvedCars,
        updatedClaimDetails.involvedCars || [],
        'Involved Car',
        existingClaim.involvedCars,
      )),
      ...(await checkInvolvedEntities(
        InvolvedParties,
        updatedClaimDetails.involvedParties || [],
        'Involved Party',
        existingClaim.involvedParties,
      )),
      ...(await checkInvolvedEntities(
        AffectedCoverages,
        updatedClaimDetails.affectedCoverages || [],
        'Affected Coverage',
        existingClaim.affectedCoverages,
      )),
    )

    // Execute all database checks in parallel
    const dbCheckResults = await Promise.all(dbChecks)
    errors.push(...dbCheckResults.filter((result) => result !== null))

    if (errors.length > 0) return res.status(400).json({ errors })

    const updateFields = {}

    if (updatedClaimDetails.occurrenceDate)
      updateFields.occurrenceDate = updatedClaimDetails.occurrenceDate
    if (updatedClaimDetails.reportingDate)
      updateFields.reportingDate = updatedClaimDetails.reportingDate
    if (updatedClaimDetails.reportingType)
      updateFields.reportingType = updatedClaimDetails.reportingType
    if (updatedClaimDetails.responsability)
      updateFields.responsability = updatedClaimDetails.responsability
    if (updatedClaimDetails.damageType)
      updateFields.damageType = updatedClaimDetails.damageType
    if (updatedClaimDetails.claimAmount)
      updateFields.claimAmount = updatedClaimDetails.claimAmount
    if (updatedClaimDetails.recourseAmount)
      updateFields.recourseAmount = updatedClaimDetails.recourseAmount
    if (updatedClaimDetails.daaq) updateFields.daaq = updatedClaimDetails.daaq
    if (updatedClaimDetails.flagFraud)
      updateFields.flagFraud = updatedClaimDetails.flagFraud
    if (updatedClaimDetails.reportingAgency)
      updateFields.reportingAgency = updatedClaimDetails.reportingAgency
    if (updatedClaimDetails.inspectionMissions)
      updateFields.inspectionMissions = updatedClaimDetails.inspectionMissions
    if (updatedClaimDetails.involvedCars)
      updateFields.involvedCars = updatedClaimDetails.involvedCars
    if (updatedClaimDetails.involvedPolicies)
      updateFields.involvedPolicies = updatedClaimDetails.involvedPolicies
    if (updatedClaimDetails.affectedCoverages)
      updateFields.affectedCoverages = updatedClaimDetails.affectedCoverages
    if (updatedClaimDetails.involvedParties)
      updateFields.involvedParties = updatedClaimDetails.involvedParties

    const updateClaim = await Claim.findOneAndUpdate(
      { claimNumber: claimId },
      { $set: updateFields },
      { new: true },
    )

    if (!updateClaim)
      return res.status(404).json({ error: `Claim ${claimId} not found` })

    res.status(200).json({ updateClaim })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}

exports.AddAffectedCouverage = async (req, res) => {
  const claimId = req.params.claimId;
  const { coverageCode, evaluation, settledAmount } = req.body;

  try {
    let errors = [];

    if (!coverageCode || !evaluation || !claimId) errors.push('Required claim data is missing');
    if (!isNumber(evaluation)) errors.push('Invalid Evaluation value type');
    if (settledAmount && !isNumber(settledAmount)) errors.push('Invalid settledAmount value type');
    if (settledAmount > evaluation) errors.push('Settled amount cannot be greater than evaluation');

    const dbChecks = [];

    const claim = await Claim.findOne({ claimNumber: claimId });
    if (!claim) dbChecks.push(`Claim ${claimId} not found`);

    const coverage = await Coverage.findOne({ code: coverageCode });
    if (!coverage) dbChecks.push(`Coverage object for code ${coverageCode} not found`)

    if (claim && coverage) {
      const existingAffectedCoverage = await AffectedCoverages.findOne({ claim: claim._id, coverage: coverage._id });
      if (existingAffectedCoverage) dbChecks.push('Affected coverage already exists in the claim')
    }

    // Execute all checks in parallel
    const checkResults = await Promise.all(dbChecks);
    errors = errors.concat(checkResults.filter(result => result !== null));
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const newAffectedCoverage = new AffectedCoverage({
      evaluation: evaluation,
      settledAmount: settledAmount,
      coverage: coverage._id,
      claim: claim._id,
    });

    await newAffectedCoverage.save();
    claim.affectedCoverages.push(newAffectedCoverage._id);
    await claim.save();

    res.status(201).json({ message: 'Affected coverage added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.FilterClaim = async (req, res) => {
  const {
    claimNumber,
    occurrenceDate,
    reportingDate,
    reportingType,
    responsability,
    damageType,
    daaq,
    status,
    involvedCars,
    involvedPolicies,
    involvedParties,
  } = req.body.filters
  try {
    let result = await Claim.find({})
      .populate({
        path: 'involvedPolicies',
        populate: { path: 'role' },
        populate: { path: 'goodUid' },
      })
      .populate({
        path: 'involvedCars',
        populate: { path: 'role' },
        populate: { path: 'goodUid' },
      })
      .populate({
        path: 'involvedParties',
        populate: { path: 'role' },
        populate: { path: 'partyUid' },
      })

let errors = [];
if(!claimNumber&&!occurrenceDate&&!reportingDate&&!reportingType&&!responsability&&!damageType&&!daaq&&!status&&!involvedCars&&!involvedPolicies&&!involvedParties){
  errors.push('At least one filter is required.')
 }
 if (!result || result.length === 0) {
  errors.push('No claims found.');
}
 if (errors.length > 0) {
  return res.status(400).json({ errors });
}
    if (claimNumber !== '') {
      result = result.filter((claim) => claim.claimNumber === claimNumber)
    }
    if (reportingType !== '') {
      result = result.filter((claim) => claim.reportingType === reportingType)
    }

    if (responsability !== '') {
      result = result.filter((claim) => claim.responsability === responsability)
    }
    if (damageType !== '') {
      result = result.filter((claim) => claim.damageType === damageType)
    }

    if (daaq !== '') {
      result = result.filter((claim) => claim.daaq === daaq)
    }
    if (status !== '') {
      result = result.filter((claim) => claim.status === status)
    }
    if(occurrenceDate){
    if (!Array.isArray(occurrenceDate) && occurrenceDate.length != 2) {
      return res
        .status(400)
        .json({ error: 'occurrence Date should be an array.' })
    } else {
      if (occurrenceDate[0] != '' && occurrenceDate[1] != '') {
        const dateMin = new Date(occurrenceDate[0])
        const dateMax = new Date(occurrenceDate[1])

        if (dateMin <= dateMax)
          result = result.filter(
            (doc) =>
              doc.occurrenceDate >= dateMin && doc.occurrenceDate <= dateMax,
          )
        else {
          return res.status(400).json({ error: 'issue dateMin or dateMax .' })
        }
      } else if (occurrenceDate[0] != '') {
        const dateMin = new Date(occurrenceDate[0])

        result = result.filter((doc) => doc.occurrenceDate >= dateMin)
      } else if (occurrenceDate[1] != '') {
        const dateMax = new Date(occurrenceDate[1])
        result = result.filter((doc) => doc.occurrenceDate <= dateMax)
      }
    }
  }
    if(reportingDate){
    if (!Array.isArray(reportingDate) && reportingDate.length != 2) {
      return res
        .status(400)
        .json({ error: 'Reporting Date should be an array.' })
    } else {
      if (reportingDate[0] != '' && reportingDate[1] != '') {
        const dateMin = new Date(reportingDate[0])
        const dateMax = new Date(reportingDate[1])

        if (dateMin <= dateMax)
          result = result.filter(
            (doc) =>
              doc.reportingDate >= dateMin && doc.reportingDate <= dateMax,
          )
        else {
          return res.status(400).json({ error: 'issue dateMin or dateMax .' })
        }
      } else if (reportingDate[0] != '') {
        const dateMin = new Date(reportingDate[0])

        result = result.filter((doc) => doc.reportingDate >= dateMin)
      } else if (reportingDate[1] != '') {
        const dateMax = new Date(reportingDate[1])
        result = result.filter((doc) => doc.reportingDate <= dateMax)
      }
    }
  }
    if (
      involvedCars &&
      Object.keys(involvedCars).length > 0 &&
      involvedCars.goodUid !== undefined &&
      involvedCars.goodUid !== ''
    ) {
      result = result.filter((claim) => {
        if (claim.involvedCars) {
          return claim.involvedCars.some((car) => {
            return (
              car.goodUid === involvedCars.goodUid ||
              (car.goodUid === involvedCars.goodUid &&
                car.role === involvedCars.role)
            )
          })
        }
      })
    }
    if (
      involvedPolicies &&
      Object.keys(involvedPolicies).length > 0 &&
      involvedPolicies.goodUid !== undefined &&
      involvedPolicies.goodUid !== ''
    ) {
      result = result.filter((claim) => {
        if (claim.involvedPolicies) {
          return claim.involvedPolicies.some((car) => {
            return (
              car.goodUid === involvedPolicies.goodUid ||
              (car.goodUid === involvedPolicies.goodUid &&
                car.role === involvedPolicies.role)
            )
          })
        }
      })
    }
    if (
      involvedParties &&
      Object.keys(involvedParties).length > 0 &&
      involvedParties.partyUid !== undefined &&
      involvedParties.partyUid !== ''
    ) {
      result = result.filter((claim) => {
        if (claim.involvedParties) {
          return claim.involvedParties.some((car) => {
            return (
              car.partyUid === involvedParties.partyUid ||
              (car.partyUid === involvedParties.partyUid &&
                car.role === involvedParties.role)
            )
          })
        }
      })
    }

    res.status(200).json(result)
  } catch (error) {
    console.error(error)
  }
}

exports.UpdateAffectedCoverage = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { coverageCode, evaluation, settledAmount } = req.body;
    let errors = [];

    if (!isNumber(evaluation)) errors.push('Invalid Evaluation value type');
    if (!isNumber(settledAmount)) errors.push('Invalid settled amount value type');
    if (settledAmount > evaluation) errors.push('Settled amount cannot be greater than evaluation');

    const dbChecks = [];

    const claim = await Claim.findOne({ claimNumber: claimId });
    if (!claim) dbChecks.push(`Claim ${claimId} not found`)
    else {
      const coverage = await Coverage.findOne({ code: coverageCode });
      if (!coverage) dbChecks.push(`Coverage object for code ${coverageCode} not found`)
      else {
        const affectedCoverage = await AffectedCoverages.findOne({
          coverage: coverage._id,
          _id: { $in: claim.affectedCoverages },
        });
        if (!affectedCoverage) dbChecks.push('Affected coverage not found');
        else {
          affectedCoverage.evaluation = evaluation;
          affectedCoverage.settledAmount = settledAmount;
          await affectedCoverage.save();
        }
      }
    }

    // Execute all checks in parallel
    const checkResults = await Promise.all(dbChecks);
    errors = errors.concat(checkResults.filter(result => result !== null));
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    res.status(200).json({ message: 'Affected Coverage details updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update coverage details' });
  }
};

exports.AddInvolvedPartyToClaim = async (req, res) => {
  try {
    const { claimNumber } = req.params
    const { partyUid, role } = req.body
    let errors = []

    // Validate the role % enum values
    if (!InvolvedParties.schema.path('role').enumValues.includes(role))
      errors.push(`Role should be one of these options: ${InvolvedParties.schema.path('role').enumValues}`);

    const dbChecks = [];

    // Check if the claim exists based on claimNumber
    const claim = await Claim.findOne({ claimNumber })
    if (!claim) dbChecks.push('Claim not found' );

    // Check if the party already exists
    let existingParty = await InvolvedParties.findOne({ partyUid })

    // If party doesn't exist create a new one
    if (!existingParty) {
      existingParty = await InvolvedParties.create({ partyUid, role })
    }
    // Check if the party already exists in the claim
    if (claim.involvedParties.includes(existingParty._id)) dbChecks.push('Party already exists in the claim' )

    // Execute all checks in parallel
    const checkResults = await Promise.all(dbChecks);
    errors = errors.concat(checkResults.filter(result => result !== null));
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Add the party to the claim
    claim.involvedParties.push(existingParty._id)
    await claim.save()

    res.status(201).json({ message: 'Party added to the claim successfully' })
  } catch (error) {
    console.error('Error adding party to claim:', error)
    res.status(500).json({ error: 'Failed to add party to claim' })
  }
}

exports.AddInvolvedCarToClaim = async (req, res) => {
  try {
    const { claimNumber } = req.params
    const { goodUid, role } = req.body
    let errors = []

    // Validate the role % enum values
    if (!InvolvedCars.schema.path('role').enumValues.includes(role))
      errors.push(`Role should be one of these options: ${InvolvedParties.schema.path('role').enumValues}`);

    const dbChecks = [];

    // Check if the claim exists based on claimNumber
    const claim = await Claim.findOne({ claimNumber })
    if (!claim) dbChecks.push('Claim not found' );

    // Check if car already exists
    let existingCar = await InvolvedCars.findOne({ goodUid: goodUid })

    // If car doesn't exist create new one
    if (!existingCar) {
      existingCar = await InvolvedCars.create({ goodUid: goodUid, role })
    }

    // Check if the car already exists in the claim
    if (claim.involvedCars.includes(existingCar._id)) dbChecks.push('Car already exists in the claim')

    // Execute all checks in parallel
    const checkResults = await Promise.all(dbChecks);
    errors = errors.concat(checkResults.filter(result => result !== null));
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Add the car to the claim
    claim.involvedCars.push(existingCar._id)
    await claim.save()

    res.status(201).json({ message: 'Car added to the claim successfully' })
  } catch (error) {
    console.error('Error adding car to claim:', error)
    res.status(500).json({ error: 'Failed to add car to claim' })
  }
}
