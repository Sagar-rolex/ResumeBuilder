const AiSuggestionReview = ({ value, onChange, onAccept, onReject }) => (
  <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3 space-y-2">
    <p className="text-xs font-medium text-purple-800">AI suggestion — review and edit before applying</p>
    <textarea
      aria-label="AI generated suggestion"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className="w-full rounded-md border border-purple-200 bg-white p-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
    />
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onReject} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">Discard</button>
      <button type="button" onClick={onAccept} className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700">Use suggestion</button>
    </div>
  </div>
);

export default AiSuggestionReview;
