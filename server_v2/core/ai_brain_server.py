# ai_brain_server.py
# 🧠 AI Brain - YouTube Optimization Engine

from flask import Flask, request, jsonify
from datetime import datetime
import re
from collections import Counter
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

class YouTubeAIOptimizer:
    def __init__(self):
        self.games = ["Generation Zero", "Deep Rock Galactic", "Helldivers", "Helldivers 2"]
        self.locations = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Sverige"]
        
        # Success patterns learned from high-performing videos
        self.success_patterns = {
            'high_ctr': ['🔥', '⚡', 'NEW', 'UPDATE', 'GAMEPLAY', 'LIVE'],
            'high_engagement': ['CO-OP', 'CHALLENGE', 'BOSS', 'SECRET', 'MISSION'],
            'viral_keywords': ['INSANE', 'EPIC', 'ULTIMATE', 'BEST', 'HOW TO', 'GAMEPLAY']
        }
        
        # Performance thresholds
        self.performance_thresholds = {
            'high_engagement': 7.0,
            'good_engagement': 5.0,
            'high_ctr': 8.0,
            'good_ctr': 5.0
        }
    
    def analyze_video_performance(self, top_videos):
        """Analysera toppvideor för att hitta framgångsmönster"""
        if not top_videos:
            return self._get_fallback_analysis()
        
        analysis = {
            'best_performers': [],
            'common_keywords': [],
            'performance_metrics': {
                'avg_engagement': 0,
                'avg_ctr': 0,
                'total_analyzed': len(top_videos)
            },
            'pattern_insights': {}
        }
        
        # Process each video
        engagement_rates = []
        ctr_rates = []
        all_keywords = []
        
        for video in top_videos:
            video_analysis = self._analyze_single_video(video)
            analysis['best_performers'].append(video_analysis)
            
            engagement_rates.append(video_analysis['engagement_rate'])
            ctr_rates.append(video_analysis['ctr'])
            all_keywords.extend(video_analysis['keywords'])
        
        # Calculate averages
        analysis['performance_metrics']['avg_engagement'] = sum(engagement_rates) / len(engagement_rates)
        analysis['performance_metrics']['avg_ctr'] = sum(ctr_rates) / len(ctr_rates)
        
        # Find common keywords
        keyword_freq = Counter(all_keywords)
        analysis['common_keywords'] = [kw for kw, count in keyword_freq.most_common(10) if count > 1]
        
        # Extract pattern insights
        analysis['pattern_insights'] = self._extract_pattern_insights(analysis['best_performers'])
        
        return analysis
    
    def _analyze_single_video(self, video):
        """Analysera en enskild video"""
        title = video.get('title', '')
        engagement = float(video.get('engagement', 0))
        ctr = float(video.get('ctr', 0))
        views = int(video.get('views', 0))
        
        return {
            'title': title,
            'engagement_rate': engagement,
            'ctr': ctr,
            'views': views,
            'keywords': self._extract_keywords(title),
            'detected_game': self._detect_game(title),
            'has_emoji': self._has_emoji(title),
            'has_location': self._has_location(title),
            'title_length': len(title),
            'performance_score': (engagement * 0.6) + (ctr * 0.4)
        }
    
    def _extract_keywords(self, title):
        """Extrahera nyckelord från titel"""
        # Clean and split title
        words = re.findall(r'\b[a-zA-Z0-9]+\b', title.lower())
        
        # Filter out stop words and short words
        stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'a', 'an'}
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        
        return keywords
    
    def _detect_game(self, title):
        """Identifiera spel från titel"""
        title_lower = title.lower()
        for game in self.games:
            if game.lower() in title_lower:
                return game
        return "Gaming"
    
    def _has_emoji(self, title):
        """Kolla om titeln innehåller emojis"""
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags
            "]+", flags=re.UNICODE
        )
        return bool(emoji_pattern.search(title))
    
    def _has_location(self, title):
        """Kolla om titeln innehåller plats"""
        title_lower = title.lower()
        return any(location.lower() in title_lower for location in self.locations)
    
    def _extract_pattern_insights(self, best_performers):
        """Extrahera insikter från bäst presterande videor"""
        if not best_performers:
            return {}
        
        insights = {
            'emoji_effectiveness': 0,
            'location_effectiveness': 0,
            'optimal_title_length': 0,
            'best_performing_games': [],
            'top_keywords': []
        }
        
        # Analyze patterns in top performers
        emoji_count = 0
        location_count = 0
        title_lengths = []
        games = []
        all_keywords = []
        
        for video in best_performers:
            if video['has_emoji']:
                emoji_count += 1
            if video['has_location']:
                location_count += 1
            
            title_lengths.append(video['title_length'])
            games.append(video['detected_game'])
            all_keywords.extend(video['keywords'])
        
        # Calculate insights
        total_videos = len(best_performers)
        insights['emoji_effectiveness'] = emoji_count / total_videos
        insights['location_effectiveness'] = location_count / total_videos
        insights['optimal_title_length'] = sum(title_lengths) / len(title_lengths)
        
        # Most common games and keywords
        insights['best_performing_games'] = Counter(games).most_common(3)
        insights['top_keywords'] = Counter(all_keywords).most_common(5)
        
        return insights
    
    def generate_recommendations(self, analysis, channel_stats):
        """Generera AI-rekommendationer baserat på analys"""
        performance_metrics = analysis['performance_metrics']
        pattern_insights = analysis['pattern_insights']
        
        # Generate title
        recommended_title = self._generate_optimized_title(analysis)
        
        # Generate tags
        recommended_tags = self._generate_optimized_tags(analysis, recommended_title)
        
        # Calculate upload time
        recommended_upload_time = self._calculate_optimal_upload_time(performance_metrics)
        
        return {
            'recommended_title': recommended_title,
            'recommended_tags': recommended_tags,
            'recommended_upload_time': recommended_upload_time
        }
    
    def _generate_optimized_title(self, analysis):
        """Generera optimerad titel baserat på analys"""
        pattern_insights = analysis['pattern_insights']
        best_performers = analysis['best_performers']
        
        if not best_performers:
            return "Gaming Gameplay | Sverige"
        
        # Determine best game to use
        if pattern_insights.get('best_performing_games'):
            best_game = pattern_insights['best_performing_games'][0][0]
        else:
            best_game = "Gaming"
        
        # Build title components
        components = [best_game]
        
        # Add action word based on performance
        if analysis['performance_metrics']['avg_engagement'] > self.performance_thresholds['high_engagement']:
            components.append(self.success_patterns['high_engagement'][0])
        else:
            components.append("Gameplay")
        
        # Add location if effective
        if pattern_insights.get('location_effectiveness', 0) > 0.3:
            components.append("| Sverige")
        
        # Add emoji if effective
        if pattern_insights.get('emoji_effectiveness', 0) > 0.4:
            components.append("🔥")
        
        # Construct title
        title = " ".join(components)
        
        # Ensure title length is reasonable
        if len(title) > 60:
            title = " ".join(components[:-1])  # Remove emoji if too long
        
        return title.strip()
    
    def _generate_optimized_tags(self, analysis, title):
        """Generera optimerade taggar"""
        tags = set()
        
        # Add detected game tags
        detected_game = self._detect_game(title)
        tags.add(detected_game)
        tags.add(detected_game.replace(" ", ""))
        
        # Add common keywords from analysis
        common_keywords = analysis.get('common_keywords', [])
        tags.update(common_keywords[:8])
        
        # Add location-based tags
        for location in self.locations:
            if location.lower() in title.lower():
                tags.add(location)
                tags.add(f"{location}Gaming")
        
        # Add performance-based tags
        metrics = analysis['performance_metrics']
        if metrics['avg_engagement'] > self.performance_thresholds['high_engagement']:
            tags.update(['HighEngagement', 'ViralContent'])
        if metrics['avg_ctr'] > self.performance_thresholds['high_ctr']:
            tags.update(['HighCTR', 'ClickOptimized'])
        
        # Add general gaming tags
        general_tags = [
            'Gaming', 'Gameplay', 'Sverige', 'Sweden', 'SwedishGamer',
            'Coop', 'Multiplayer', 'Live', 'Gamer', 'Playthrough'
        ]
        tags.update(general_tags)
        
        return list(tags)[:20]  # Return max 20 tags
    
    def _calculate_optimal_upload_time(self, performance_metrics):
        """Beräkna optimal uppladdningstid baserat på prestanda"""
        avg_engagement = performance_metrics['avg_engagement']
        
        if avg_engagement > self.performance_thresholds['high_engagement']:
            # High engagement = prime time evening
            return "18:30"
        elif avg_engagement > self.performance_thresholds['good_engagement']:
            # Good engagement = afternoon
            return "16:00"
        else:
            # Lower engagement = try different time
            return "14:00"
    
    def _get_fallback_analysis(self):
        """Fallback analysis när ingen data finns"""
        return {
            'best_performers': [],
            'common_keywords': ['gaming', 'gameplay', 'sweden'],
            'performance_metrics': {
                'avg_engagement': 5.0,
                'avg_ctr': 6.0,
                'total_analyzed': 0
            },
            'pattern_insights': {
                'emoji_effectiveness': 0.3,
                'location_effectiveness': 0.4,
                'optimal_title_length': 40,
                'best_performing_games': [('Gaming', 1)],
                'top_keywords': [('gaming', 1), ('gameplay', 1)]
            }
        }

# Global AI optimizer instance
ai_optimizer = YouTubeAIOptimizer()

@app.route('/ai/webhook/analytics', methods=['POST'])
def handle_analytics_webhook():
    """Hantera inkommande analytics data från Google Apps Script"""
    try:
        # Log incoming request
        logger.info("📊 Received analytics webhook request")
        
        # Get and validate request data
        data = request.get_json()
        if not data:
            logger.error("❌ No JSON data received")
            return jsonify({'error': 'No JSON data received'}), 400
        
        # Extract data
        top_videos = data.get('top_videos', [])
        channel_stats = data.get('channel_stats', {})
        
        logger.info(f"🔍 Analyzing {len(top_videos)} top videos")
        
        # Analyze video performance
        analysis = ai_optimizer.analyze_video_performance(top_videos)
        
        # Generate AI recommendations
        recommendations = ai_optimizer.generate_recommendations(analysis, channel_stats)
        
        # Prepare response
        response = {
            'analysis_id': f"ai_{int(datetime.now().timestamp())}",
            'timestamp': datetime.now().isoformat(),
            'recommendations': recommendations,
            'insights': {
                'analyzed_videos': analysis['performance_metrics']['total_analyzed'],
                'average_engagement': round(analysis['performance_metrics']['avg_engagement'], 2),
                'average_ctr': round(analysis['performance_metrics']['avg_ctr'], 2),
                'top_performing_keywords': analysis['common_keywords'][:5],
                'pattern_effectiveness': {
                    'emoji_effectiveness': round(analysis['pattern_insights'].get('emoji_effectiveness', 0), 2),
                    'location_effectiveness': round(analysis['pattern_insights'].get('location_effectiveness', 0), 2)
                }
            }
        }
        
        logger.info(f"🧠 AI recommendations generated: {recommendations['recommended_title']}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Webhook error: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/ai/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'YouTube AI Brain',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/')
def home():
    """Root endpoint with service information"""
    return jsonify({
        'message': 'YouTube AI Brain Server is running',
        'endpoints': {
            'health_check': 'GET /ai/health',
            'analytics_webhook': 'POST /ai/webhook/analytics'
        },
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    # Configuration
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print("🚀 Starting YouTube AI Brain Server...")
    print(f"📍 Host: {host}")
    print(f"📍 Port: {port}")
    print("🔧 Available Endpoints:")
    print("   GET  /ai/health - Health check")
    print("   POST /ai/webhook/analytics - AI recommendations")
    print("   GET  / - Service information")
    print("\n📊 Ready to optimize YouTube content!")
    
    app.run(host=host, port=port, debug=debug)
