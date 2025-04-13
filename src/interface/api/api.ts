import express, { Request, Response, Router } from 'express'
import { userController, messageController } from './controllers'

const router: Router = express.Router()

// User routes
router.post('/users', (req: Request, res: Response) => {
  userController.createUser(req, res)
})

router.post('/users/:user/follow', (req: Request, res: Response) => {
  userController.followUser(req, res)
})

router.get('/users/:user/timeline', (req: Request, res: Response) => {
  userController.getTimeline(req, res)
})

router.get('/users/:user/wall', (req: Request, res: Response) => {
  userController.getWall(req, res)
})

// Message routes
router.post('/messages', (req: Request, res: Response) => {
  messageController.postMessage(req, res)
})

router.put('/messages/:messageId', (req: Request, res: Response) => {
  messageController.editMessage(req, res)
})

export { router as apiRouter }
