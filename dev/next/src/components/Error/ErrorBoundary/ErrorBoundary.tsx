import { Component, ErrorInfo, ReactNode } from 'react'

import { parseUnknownError } from '../../../util/parseUnknownError'
import { reportError } from '../../../util/reportError'
import { UnexpectedError } from '../UnexpectedError'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(unknownError: unknown, errorInfo: ErrorInfo): void {
    const error = parseUnknownError(unknownError)
    reportError(error, errorInfo)
  }

  render(): JSX.Element {
    if (this.state.hasError) {
      return <UnexpectedError />
    }
    return this.props.children as JSX.Element
  }
}
