'use strict'

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandler } = require('../../helper/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();


router.post('/user/register',asyncHandler(accessController.register))
router.post('/user/login',asyncHandler(accessController.login))

/* Authentication*/
router.use(authentication)

///////
router.post('/user/logout',asyncHandler(accessController.logout))
router.post('/user/handlerRefreshToken',asyncHandler(accessController.handlerRefreshToken))

module.exports = router