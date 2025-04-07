import { DateProvider } from '../application/secondaryPorts/dateProvider'

export class StubDateProvider implements DateProvider {
  now!: Date
  getNow(): Date {
    return this.now
  }
}
