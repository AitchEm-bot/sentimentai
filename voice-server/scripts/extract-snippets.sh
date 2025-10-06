#!/bin/bash

# Extract 30-second audio snippets for website showcase
# Requires: ffmpeg

KNOWLEDGE_BASE="../knowledge-base"
OUTPUT_DIR="${KNOWLEDGE_BASE}/snippets"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🎵 Extracting 30-second audio snippets..."
echo "========================================"

# Angry Call - Extract from 1:00 to 1:30 (peak frustration moment)
echo ""
echo "📍 Angry Call: Extracting peak frustration moment (1:00-1:30)..."
ffmpeg -i "${KNOWLEDGE_BASE}/Angry_Call.mp3" -ss 60 -t 30 -acodec copy "${OUTPUT_DIR}/Angry_Call_snippet.mp3" -y 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Created: Angry_Call_snippet.mp3"
else
    echo "   ❌ Error creating Angry_Call_snippet.mp3"
fi

# Happy Call - Extract from 1:15 to 1:45 (anniversary upgrade offer)
echo ""
echo "📍 Happy Call: Extracting anniversary upgrade moment (1:15-1:45)..."
ffmpeg -i "${KNOWLEDGE_BASE}/Happy_Call.mp3" -ss 75 -t 30 -acodec copy "${OUTPUT_DIR}/Happy_Call_snippet.mp3" -y 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Created: Happy_Call_snippet.mp3"
else
    echo "   ❌ Error creating Happy_Call_snippet.mp3"
fi

# Normal Call - Extract from 2:00 to 2:30 (standard resolution section)
echo ""
echo "📍 Normal Call: Extracting standard inquiry section (2:00-2:30)..."
ffmpeg -i "${KNOWLEDGE_BASE}/Normal_Call.mp3" -ss 120 -t 30 -acodec copy "${OUTPUT_DIR}/Normal_Call_snippet.mp3" -y 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Created: Normal_Call_snippet.mp3"
else
    echo "   ❌ Error creating Normal_Call_snippet.mp3"
fi

echo ""
echo "========================================"
echo "✨ Snippet extraction complete!"
echo ""
echo "📁 Output directory: ${OUTPUT_DIR}"
echo ""
ls -lh "${OUTPUT_DIR}"
echo ""
echo "💡 Next steps:"
echo "   1. Move snippets to public/audio/ directory"
echo "   2. Create CallShowcase component"
echo "   3. Import analysis JSON files"
echo "   4. Build demo section UI"
echo ""
