export function HowItWorks(){
    return (
         <>
    <div id="howitworks" className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-3xl p-12 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="text-5xl font-bold text-cyan-500">01</div>
              <h4 className="text-lg font-semibold text-gray-900">Video Analysis</h4>
              <p className="text-gray-600 text-sm">Our AI extracts visual features, audio transcripts from your uploaded video.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl font-bold text-cyan-500">02</div>
              <h4 className="text-lg font-semibold text-gray-900">Semantic Matching</h4>
              <p className="text-gray-600 text-sm">Using CLIP, YOLO, and Whisper, we create multimodal embeddings for deep content understanding.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl font-bold text-cyan-500">03</div>
              <h4 className="text-lg font-semibold text-gray-900">Recommendations</h4>
              <p className="text-gray-600 text-sm">Discover semantically similar videos from across the web based on comprehensive AI analysis.</p>
            </div>
          </div>
        </div>
    </>
    )
   

}