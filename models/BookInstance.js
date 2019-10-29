const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema ({
    book: {type:Schema.Types.ObjectId, ref:'Book', required: true},
    imprint: {type:String, required: true},
    status: {type: String, required: false, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved']},
    due_back: {type: Date, default: Date.now},
});
BookInstanceSchema
.virtual('due_back_formatted')
.get(function () {
  return moment(this.due_back).format('MMMM Do, YYYY');
});


BookInstanceSchema.virtual('url').get(function(){
    return '/catalog/bookinstance/'+this._id;
})

module.exports = mongoose.model('BookInstance',BookInstanceSchema);