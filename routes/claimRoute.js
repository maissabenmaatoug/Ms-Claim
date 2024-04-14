const express = require('express')
const router = express.Router()

const {
  CreateClaim,
  GetClaimDetails,
  UpdateStatus,
  AddAffectedCouverage,
  UpdateClaim,
  AddInvolvedCarToClaim,
  AddInvolvedPartyToClaim,
  FilterClaim,
  UpdateAffectedCoverage,
} = require('../controllers/claim')

/**
 * @swagger
 * paths:
 *   /api/v0.1/claim/CreateClaim:
 *     post:
 *       tags:
 *         - Claim
 *       summary: Create a new insurance claim.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - claimNumber
 *                 - occurrenceDate
 *                 - reportingDate
 *                 - reportingType
 *                 - responsibility
 *                 - damageType
 *                 - claimAmount
 *                 - reportingAgency
 *               properties:
 *                 claimNumber:
 *                   type: string
 *                   description: Unique identifier for the claim.
 *                 occurrenceDate:
 *                   type: string
 *                   format: date
 *                   description: Date the incident occurred.
 *                 reportingDate:
 *                   type: string
 *                   format: date
 *                   description: Date the claim was reported.
 *                 reportingType:
 *                   type: string
 *                   enum:
 *                     - FirstPartyClaim
 *                     - ThirdPartyClaim
 *                   description: Type of claim being reported.
 *                 responsibility:
 *                   type: string
 *                   enum:
 *                     - FullResponsibility
 *                     - PartialResponsibility
 *                     - NoResponsibility
 *                     - UnderInvestigation
 *                   description: Insured party's level of responsibility in the incident.
 *                 damageType:
 *                   type: string
 *                   enum:
 *                     - MaterialDamage
 *                     - BodilyInjury
 *                   description: Type of damage incurred.
 *                 daaq:
 *                   type: string
 *                   description: DAAQ code (optional).
 *                 flagFraud:
 *                   type: boolean
 *                   description: Flag indicating suspected fraud (optional).
 *                 claimAmount:
 *                   type: number
 *                   description: Amount of claim being filed.
 *                 recourseAmount:
 *                   type: number
 *                   description: Amount expected to be recovered from other parties (optional).
 *                   default: 0
 *                 reportingAgency:
 *                   type: string
 *                   description: reportingAgency for claim.
 *                 inspectionMissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Define properties for involved inspection Mission details (e.g., uid)
 *                 involvedCars:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Define properties for involved car details (e.g., license plate, VIN)
 *                 involvedPolicies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Define properties for involved policy details (e.g., policy number)
 *                 affectedCoverages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Define properties for affected Coverages details (e.g., coverage type, limit)
 *                 involvedParties:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Define properties for involved party details (e.g., name, role)
 *       responses:
 *         201:
 *           description: Claim created successfully.
 *           content:
 *             application/json:
 *               schema:
 *         400:
 *           description: Bad request, invalid claim data or occurrence date after reporting date.
 *
 */
router.post('/claim/CreateClaim', CreateClaim)

/**
 * @swagger
 * paths:
 *   /claim/GetClaimDetails/{claimId}:
 *     get:
 *       tags:
 *         - Claim
 *       summary: Get details of a specific claim.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: claimId
 *           in: path
 *           required: true
 *           type: string
 *           description: Unique identifier of the claim.
 *       responses:
 *         200:
 *           description: Claim details retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *
 *         404:
 *           description: Claim not found.
 */
router.get('/claim/GetClaimDetails/:claimId', GetClaimDetails)

/**
 * @swagger
 * paths:
 *   /claim/UpdateClaim/{claimId}:
 *     put:
 *       tags:
 *         - Claim
 *       summary: Update details of a specific claim.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: claimId
 *           in: path
 *           required: true
 *           type: string
 *           description: Unique identifier of the claim.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - occurrenceDate
 *                 - reportingDate
 *                 - reportingType
 *                 - responsibility
 *                 - damageType
 *                 - claimAmount
 *                 - reportingAgency
 *               properties:
 *                 occurrenceDate:
 *                   type: string
 *                   format: date
 *                   description: Date the incident occurred.
 *                 reportingDate:
 *                   type: string
 *                   format: date
 *                   description: Date the claim was reported.
 *                 reportingType:
 *                   type: string
 *                   enum:
 *                     - FirstPartyClaim
 *                     - ThirdPartyClaim
 *                   description: Type of claim being reported.
 *                 responsability:
 *                   type: string
 *                   enum:
 *                     - FullResponsability
 *                     - PartialResponsability
 *                     - NoResponsability
 *                     - UnderInvestigation
 *                   description: Insured party's level of responsability in the incident.
 *                 damageType:
 *                   type: string
 *                   enum:
 *                     - MaterialDamage
 *                     - BodilyInjury
 *                   description: Type of damage incurred.
 *                 daaq:
 *                   type: string
 *                   description: DAAQ code (optional).
 *                 flagFraud:
 *                   type: boolean
 *                   description: Flag indicating suspected fraud (optional).
 *                 claimAmount:
 *                   type: number
 *                   description: Amount of claim being filed.
 *                 recourseAmount:
 *                   type: number
 *                   description: Amount expected to be recovered from other parties (optional).
 *                   default: 0
 *                 settledAmount:
 *                   type: number
 *                   description: Amount settled on the claim (optional).
 *                   default: 0
 *                 evaluation:
 *                   type: string
 *                   description: Initial evaluation of the claim (optional).
 *                 reportingAgency:
 *                   type: string
 *                   description: Agency reporting the claim.
 *                 involvedCars:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Define properties for involved car details (e.g., license plate, VIN)
 *                 involvedPolicies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Define properties for involved policy details (e.g., policy number)
 *                 involvedCoverages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Define properties for involved coverage details (e.g., coverage type, limit)
 *                 involvedParties:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *       responses:
 *         200:
 *           description: Claim details updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *         400:
 *           description: Bad request, invalid claim data or unauthorized update.
 *         404:
 *           description: Claim not found.
 */
router.put('/claim/UpdateClaim/:claimId', UpdateClaim)

/**
 * @swagger
 * paths:
 *   /claim/UpdateStatus/{claimId}:
 *     put:
 *       tags:
 *         - Claim
 *       summary: Update the status of a specific claim.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: claimId
 *           in: path
 *           required: true
 *           type: string
 *           description: Unique identifier of the claim.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *               properties:
 *                 status:
 *                   type: string
 *                   enum:
 *                     - OPEN
 *                     - AWAITING_ASSIGNMENT
 *                     - AWAITING_INSPECTION
 *                     - AWAITING_DOCUMENTATION
 *                     - UNDER_REVIEW
 *                     - AWAITING_EXPERT_ASSESSMENT
 *                     - AWAITING_GARAGE_ASSESSMENT
 *                     - AWAITING_PHOTO_EVIDENCE
 *                     - AWAITING_EXPERT_REPORT
 *                     - PENDING_APPROVAL
 *                     - SETTLED
 *                     - CLOSED
 *                   description: Target status for the claim.
 *       responses:
 *         200:
 *           description: Claim status updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *         400:
 *           description: Bad request, invalid status or unauthorized update.
 *         404:
 *           description: Claim not found.
 */
router.put('/claim/UpdateStatus/:claimId', UpdateStatus)

/**
 * @swagger
 * paths:
 *   /claim/AddInvolvedPartyToClaim/{claimId}:
 *     post:
 *       tags:
 *         - Claim
 *       summary: Add a party to an existing claim.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: claimId
 *           in: path
 *           required: true
 *           type: string
 *           description: Unique identifier of the claim.
 *         - name: partyUid
 *           in: body
 *           required: true
 *           type: string
 *           description: Unique identifier of the party to add.
 *         - name: role
 *           in: body
 *           required: true
 *           type: string
 *           enum:
 *             - INSURED
 *             - DRIVER
 *             - WITNESS
 *             - THIRD_PARTY
 *             - BENEFICIARY
 *             - OTHER
 *           description: Role of the party in the claim.
 *       responses:
 *         201:
 *           description: Party added to the claim successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Success message.
 *         400:
 *           description: Bad request, invalid data or party already exists.
 *         404:
 *           description: Claim or party not found.
 */
router.post(
  '/claim/AddInvolvedPartyToClaim/:claimNumber',
  AddInvolvedPartyToClaim,
)

/**
 * @swagger
 * paths:
 *   /claim/AddInvolvedCarToClaim/{claimId}:
 *     post:
 *       tags:
 *         - Claim
 *       summary: Add a car to an existing claim.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: claimId
 *           in: path
 *           required: true
 *           type: string
 *           description: Unique identifier of the claim.
 *         - name: carUid
 *           in: body
 *           required: true
 *           type: string
 *           description: Unique identifier of the car to add.
 *         - name: role
 *           in: body
 *           required: true
 *           type: string
 *           enum:
 *             - INVOLVED_CAR
 *             - WITNESS_CAR
 *             - OTHER
 *           description: Role of the car in the claim.
 *       responses:
 *         201:
 *           description: Car added to the claim successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Success message.
 *         400:
 *           description: Bad request, invalid data or car already exists.
 *         404:
 *           description: Claim or car not found.
 */
router.post('/claim/AddInvolvedCarToClaim/:claimNumber', AddInvolvedCarToClaim)

/**
 * @swagger
 * paths:
 *   /claim/AddAffectedCouverage/{claimId}:
 *     post:
 *       tags:
 *         - Claim
 *       summary: Add an affected coverage to an existing claim.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: claimId
 *           in: path
 *           required: true
 *           type: string
 *           description: Unique identifier of the claim.
 *         - name: coverageCode
 *           in: body
 *           required: true
 *           type: string
 *           description: Code of the coverage to add.
 *         - name: evaluation
 *           in: body
 *           required: true
 *           type: number
 *           description: Evaluation of the coverage.
 *         - name: settledAmount
 *           in: body
 *           required: false
 *           type: number
 *           default: 0
 *           description: Settled amount for the coverage (must be less than or equal to evaluation).
 *       responses:
 *         201:
 *           description: Affected coverage added successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Success message.
 *         400:
 *           description: Bad request, invalid data, settled amount exceeds evaluation, or coverage already exists.
 *         404:
 *           description: Claim or coverage not found.
 */
router.put('/claim/AddAffectedCouverage/:claimId', AddAffectedCouverage)

/**
 * @swagger
 * paths:
 *   /claim/UpdateAffectedCouverage/{claimId}:
 *     put:
 *       tags:
 *         - Claim
 *       summary: Update details of an affected coverage.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: claimId
 *           in: path
 *           required: true
 *           type: string
 *           description: Unique identifier of the claim.
 *         - name: coverageCode
 *           in: body
 *           required: true
 *           type: string
 *           description: Code of the coverage to update.
 *         - name: evaluation
 *           in: body
 *           required: true
 *           type: number
 *           description: Updated evaluation of the coverage.
 *         - name: settledAmount
 *           in: body
 *           required: true
 *           type: number
 *           description: Updated settled amount for the coverage (must be less than or equal to evaluation).
 *       responses:
 *         200:
 *           description: Affected coverage details updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Success message.
 *         400:
 *           description: Bad request, invalid data, settled amount exceeds evaluation, or coverage not found.
 *         404:
 *           description: Claim not found.
 */
router.put('/claim/UpdateAffectedCouverage/:claimId', UpdateAffectedCoverage)
//claimId = claimNumber

router.post('/claim/FilterClaim', FilterClaim)

module.exports = router
