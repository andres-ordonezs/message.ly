"use strict";

const { BadRequestError, UnauthorizedError } = require("../expressError");
const Message = require("../models/message");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");

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

router.get('/:id', ensureLoggedIn, async function (req, res, next) {

  const id = Number(req.params.id);
  const user = res.locals.user;
  const message = await Message.get(id);

  if (user.username !== message.to_user.username &&
    user.username !== message.from_user.username) {
    throw new UnauthorizedError('User is not a From or a To user');
  }


  return res.json(message);

});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function (req, res, next) {
  const from_username = res.locals.user.username;

  const newMessage = await Message.create({
    from_username: from_username,
    to_username: req.body.to_username,
    body: req.body.body
  });

  return res.json({ message:newMessage });
});



/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function (req, res, next) {

  const id = req.params.id;
  const user = res.locals.user;
  const message = await Message.get(id);

  if (user.username === message.to_user.username) {
    const readMsg = await Message.markRead(id);
    return readMsg;
  } else {
    throw new BadRequestError('User is not recepient');
  }

});


module.exports = router;