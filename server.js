// var DATABASE_URL = require('./config');
var mongoose = require('mongoose');
var MovieInfo = require('./schema');

const port = process.env.PORT || 3001;
const server = require('http').createServer().listen(port);
const io = require('socket.io')(server);

// connect to database
mongoose.connect(process.env.db_url || DATABASE_URL, { useNewUrlParser: true });

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.on('open', () => {
    console.log('Connected to database');
});



io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('saveToDb', ({ id, video_info }) => {
        MovieInfo.findOne({movie_id: id}, function(err, result){
            if (err) return console.log(err);
            if (result === null) {
                console.log("Saving: " + id +  ', vid_info: ' + video_info);
                var movie = new MovieInfo({ movie_id: id, video_info: video_info });
                movie.save((err, res) => {
                    if (err) return console.error(err);
                    console.log('Saved record ' + id + ' to database');
                    socket.emit('Response', res);
            });
            }
            else {
                console.log("Movie already exists, not added to database");
            }
        });
        
    });

    socket.on('requestVideos', function(id, fn) {
        MovieInfo.findOne({ movie_id: id }, function (err, result) {
            console.log('Looking for ' + id)
            if (err) return console.log(err);

            if (result != null) {
                console.log("Found movie in database");
                fn(result.video_info);
            }
            else 
                console.log("Movie not found");
            
        })
    });
})