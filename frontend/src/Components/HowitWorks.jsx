export function HowItWorks() {
  return (
    <>
      <div id="howitworks" className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-3xl p-12 mb-16">
        <div className="text-center mb-16">
          <div className="inline-block relative mb-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              How it Works
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full blur-sm"></div>
          </div>
          <p className="text-lg text-gray-500 mt-6">Three simple steps to unlock powerful video discovery</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="text-5xl font-bold text-cyan-500">01</div>
            <h4 className="text-xl font-semibold text-gray-900">Video Analysis</h4>
            <p className="text-gray-600 text-medium">Our AI extracts visual features, audio transcripts from your uploaded video.</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-5xl font-bold text-cyan-500">02</div>
            <h4 className="text-xl font-semibold text-gray-900">Semantic Matching</h4>
            <p className="text-gray-600 text-medium">Using CLIP, YOLO, and Whisper and other models, we create multimodal embeddings for deep content understanding.</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-5xl font-bold text-cyan-500">03</div>
            <h4 className="text-xl font-semibold text-gray-900">Recommendations</h4>
            <p className="text-gray-600 text-medium">Discover semantically similar videos from across the web based on comprehensive AI analysis.</p>
          </div>
        </div>
      </div>
    </>
  )


}