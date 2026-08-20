/**
 * Safely navigates back in browser history if history stack has a previous entry;
 * otherwise navigates to the provided fallback path to prevent blank pages or getting stuck.
 *
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {string} [fallback='/']
 */
export function smartGoBack(navigate, fallback = '/') {
  if (typeof window !== 'undefined' && window.history.state && window.history.state.idx > 0) {
    navigate(-1)
  } else {
    navigate(fallback, { replace: true })
  }
}
