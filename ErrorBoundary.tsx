import { Component, type ErrorInfo, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.hasError) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-bold text-gray-900">Có lỗi xảy ra</h1><p className="mt-2 text-sm text-gray-500">Trang gặp sự cố. Bạn có thể tải lại để tiếp tục.</p><button onClick={()=>window.location.reload()} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white">Tải lại trang</button></div>;
    return this.props.children;
  }
}
