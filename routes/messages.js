"use strict";

const { BadRequestError, UnauthorizedError } = require("../expressError");
const Message = require("../models/message");

const Router = require("express").Router;
const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', async function (req, res, next) {

  const id = req.params.id;

  const message = await Message.get(Number(id));

  const user = res.locals.user;

  if (user.username !== message.to_user.username ||
    user.username !== message.from_user.username) {
    return new UnauthorizedError('User is not a From or a To user');
  }

  return res.json({ message: message });

  // console.log("*********payload: ", res.locals.payload);

});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', async function (req, res, next) {

  const from_username = res.locals.user.username;

  const newMessage = Message.create(
    from_username,
    req.body.to_username,
    req.body.body
  );

  return res.json(newMessage);


});



/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', async function (req, res, next) {

  const id = req.params.id;

  const user = res.locals.user;

  if (user.username === message.to_user) {
    const message = Message.markRead(id);
    return message;
  }

  return new BadRequestError('User is not recepient');

});


module.exports = router;