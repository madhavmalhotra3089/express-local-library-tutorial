const Author = require('../models/Author');
const Book = require ('../models/book');
const async = require ('async');
// Display list of all Authors.

const validator = require('express-validator');

exports.author_list = function(req, res,next) {

    Author.find().sort([['family_name','ascending']]).exec(function(err,list_of_authors) {
        if (err) return next(err);
        res.render('author_list',{
            title: 'Author List',
            author_list: list_of_authors,
        })
    });

};

// Display detail page for a specific Author.
exports.author_detail = function(req, res,next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback);
        },
        author_books: function(callback) {
            Book.find({'author':req.params.id}).exec(callback);
        }
    },function(err,results) {
        if (err) return next(err);
        if (results.author===null) {
            let err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail',{
            title: 'Author Detail',
            author: results.author,
            author_books: results.author_books
        });
    });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form',{
        title: 'Create Author'
    })
};

// Handle Author create on POST.
exports.author_create_post = [
    validator.body('first_name').isLength({min: 1}).trim().withMessage("First Name must be specified"),
    validator.body('family_name').isLength({min: 1}).trim().withMessage('Family Name must be specified'),
    validator.body('date_of_birth','Invalid Date of Birth').optional({checkFalsy: true}).isISO8601(),
    validator.body('date_of_death','Invalid Date of Death').optional({checkFalsy: true}).isISO8601(),
    validator.sanitizeBody('first_name').escape(),
    validator.sanitizeBody('family_name').escape(),
    validator.sanitizeBody('date_of_birth').toDate(),
    validator.sanitizeBody('date_of_death').toDate(),
    (req,res,next) => {
        const errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            res.render('author_form', {
                title: 'Create Author',
                author: req.body,
                errors: errors.array(),
            });
            return;
        }
        
        let author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
        });

        author.save(function (err) {
            if (err) return next(err);
            res.redirect(author.url);
        });

    }

]
// Display Author delete form on GET.
exports.author_delete_get = function(req, res,next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback);

        },
        authors_books: function(callback) {
            Book.find({
                'author': req.params.id,
            }).exec(callback);
        },
    },function(err,results) {
        if (err) return next(err);

        if(results.author===null) {
            console.log("No author found");
            res.redirect('/catalog/authors');
            return;
        }
        else 
        {
        res.render('author_delete',{
            title: 'Delete Author',
            author: results.author,
            author_books: results.author_books,
        });
    }
    });


};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
    async.parallel({
author: function(callback) {
    Author.findById(req.body.authorid).exec(callback);
},
authors_books: function(callback) {
    Book.find({
        'author': req.body.authorid,
    }).exec(callback);
},

    }, function(err,results) {


        if(err) next(err);

        if(results.authors_books && results.author_books.length>0) {
            res.render('author_delete',{
                title: 'Delete Author',
                author: results.author,
                author_books: results.author_books,
            });
            return;
        }
        else {
            Author.findByIdAndRemove(req.body.authorid,function deleteAuthor(err) {
                if (err) return next(err);
                res.redirect('/catalog/authors');
            })
        }


    })
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};