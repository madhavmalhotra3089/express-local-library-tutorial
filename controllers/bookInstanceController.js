const BookInstance = require('../models/BookInstance');
const Book = require('../models/Book');
const validator = require('express-validator');


// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
    BookInstance.find({},'book imprint status due_back').populate('book').exec((err,list_bookinstances)=>{
        if(err) return next(err);
        res.render('bookinstance_list',{ title: 'Book Instance List', bookinstance_list: list_bookinstances })
    })
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res,next) {
    BookInstance.findById(req.params.id).populate('book').exec(function(err,bookinstance){
        if (err) return next(err);
        if(bookinstance===null) {
            let err = new Error('Book Copy not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_detail',{
            title: 'Copy '+bookinstance.book.title,
            bookinstance: bookinstance,
        })
    })

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res,next) {
    Book.find({},'title').exec(function(err,books){
        if (err) return next(err);

        res.render('bookinstance_form',{
            title: 'Create Book Instance',
            book_list: books,
        });
    })
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    validator.body('book','Book must be specified').isLength({min: 1}).trim(),
    validator.body('imprint','Imprint must be specified').isLength({min: 1}).trim(),
    validator.body('due_back','Invalid Date').optional({checkFalsy:true}).isISO8601(),
    validator.body('status','Status must be specified').isLength({min:1}).trim(),
    validator.sanitizeBody('book').escape(),
    validator.sanitizeBody('imprint').escape(),
    validator.sanitizeBody('status').trim().escape(),
    validator.sanitizeBody('due_back').toDate(),
    (req,res,next) => {
     
        const errors = validator.validationResult(req);
      
        let bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            Book.find({},'title').exec(function(err,results){
                if (err) return next(err);
                res.render('bookinstance_form',{
                    title: 'Create Book Instance',
                    book_list: books,
                    selected_book: bookinstance.book._id,
                    errors: errors.array(),
                });

             
            });
            return;
        }
        else {
        bookInstance.save(function(err) {
            if (err) return next(err);
          
            res.redirect(bookInstance.url);
        });
    }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};