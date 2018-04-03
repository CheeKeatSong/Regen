const passport = require('passport');
const Project = require('../models/Project');
// const Document = require('../models/Document');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * GET /project
 * Project panel page.
 */
 exports.getPanel = (req, res, next) => {
 	var ProjectList = [];
 	var j = 0;
 	if (req.user.project.length == 0) {
 		res.render('project/panel', {
 			title: 'Project Panel',
 			project : ProjectList
 		});  
 	}
 	for (var i =  0; i < req.user.project.length; i++) {
 		Project.findOne({ _id: mongoose.Types.ObjectId(req.user.project[i].projectID) }, { document: 0 }, (err, project) => {
 			if (err) { return next(err); }
 			j++;
 			if (project){
 				ProjectList.push(project);
 			}
 			if (j === req.user.project.length) {
 				res.render('project/panel', {
 					title: 'Project Panel',
 					project : ProjectList
 				});  
 			}
 		});
 	}
 };

/**
 * POST /project/new
 * Create new project.
 */
 exports.postCreateProject = (req, res, next) => {

 	req.assert('projectName', 'Project name cannot be blank').notEmpty();
 	req.assert('projectName', 'Project name length must be between 5 - 35').isLength({ min: 5, max: 35 });
 	req.assert('projectDescription', 'Description cannot be blank').notEmpty();
 	req.assert('projectDescription', 'Project description length must be between 15 - 300').isLength({ min: 15, max: 300 });

 	const errors = req.validationErrors();

 	if (errors) {
 		req.flash('errors', errors);
 		return res.redirect('/project');
 	}

 	const project = new Project({
 		name: req.body.projectName,
 		description: req.body.projectDescription,
 		access: [{
 			name: req.user.profile.name,
 			emailAddress: req.user.email,
 			permission: "Admin"
 		}]
 	});

 	Project.findOne({ name: req.body.projectName, access: { name: req.user.profile.name} }, (err, existingProject) => {
 		if (err) { return next(err); }
 		if (existingProject) {
 			req.flash('errors', { msg: 'Project with the same name existed' });
 			return res.redirect('/project');
 		}
 		project.save((err, newProject) => {
 			if (err) { return next(err); }
 			User.findById(req.user.id, (err, user) => {
 				if (err) { return next(err); }
 				user.project.push({ projectID:newProject._id });
 				user.save((err) => {
 					if (err) { return next(err); }
 					req.flash('success', { msg: 'Project successfully created.' });
 					res.redirect('/project');
 				});
 			});
 		});
 	});
 };

/**
 * POST /project/delete
 * Delete project.
 */
 exports.postDeleteProject = (req, res, next) => {

 	Project.findOne({ _id: mongoose.Types.ObjectId(req.body.projectID) }, (err, project) => {
 		if (err) { return next(err); }
 		if (project) {
 			var accessRight = checkAccessRight(project, req.user.email);
 			if (accessRight !== 'Admin') {
 				req.flash('errors', { msg: 'You need to have admin right to execute the action.' });
 				return res.redirect('/project/' + req.body.projectID);
 			}
 			Project.remove({ _id: mongoose.Types.ObjectId(req.body.projectID) }, (err) => {
 				if (err) { return next(err); }
 				var j = 0;
 				for (var i = project.access.length - 1; i >= 0; i--) {
 					User.update({ "email" : project.access[i].emailAddress }, {"$pull": { "project": { "projectID": req.body.projectID }}}, err => {
 						if (err) { return next(err); }
 					});
 					j++;
 					if (j === req.user.project.length) {
 						req.flash('info', { msg: 'The project has been deleted.' });
 						res.redirect('/project');
 					}
 				}
 			});
 		}else{
 			req.flash('errors', { msg: 'Project does not exists' });
 			return res.redirect('/project');
 		}
 	});
 };

 /**
 * GET /panel/:id
 * Project page.
 */
 exports.getProjectDetails = (req, res, next) => {
 	var projectID = req.params.id;
 	Project.findOne({ _id: mongoose.Types.ObjectId(projectID) } , (err, project) => {
 		if (err) { return next(err); }
 		if (project){
 			res.render('project/details', {
 				title: 'Project Details',
 				project : project
 			});  
 		}
 	});
 };

/**
 * POST /doc/new
 * Create new document.
 */
 exports.postCreateDocument = (req, res, next) => {

 	req.assert('documentName', 'Project name cannot be blank').notEmpty();
 	req.assert('documentName', 'Project name length must be between 5 - 35').isLength({ min: 5, max: 35 });
 	req.assert('documentDescription', 'Description cannot be blank').notEmpty();
 	req.assert('documentDescription', 'Project description length must be between 15 - 300').isLength({ min: 15, max: 300 });
 	req.assert('documentType', 'Project type cannot be blank').notEmpty();

 	const errors = req.validationErrors();

 	if (errors) {
 		req.flash('errors', errors);
 		return res.redirect('/project/' + req.body.projectID);
 	}

 	// const doc = new Document({
 	// 	name: req.body.documentName,
 	// 	type: req.body.documentType,
 	// 	description: req.body.documentDescription,
 	// });

 	Project.findOne({ _id: mongoose.Types.ObjectId(req.body.projectID) }, (err, selectedProject) => {
 		if (err) { return next(err); }
 		if (selectedProject){
 			for (var i = selectedProject.document.length - 1; i >= 0; i--) {
 				if(selectedProject.document[i].name === req.body.documentName && selectedProject.document[i].type === req.body.documentType){
 					req.flash('errors', { msg: 'Document with the same name existed' });
 					return res.redirect('/project/' + req.body.projectID);
 				}
 			}
 			Project.update( {_id: mongoose.Types.ObjectId(req.body.projectID) }, 
 			{ 
 				"$push": {
 					"document": {
 						name: req.body.documentName,
 						type: req.body.documentType,
 						description: req.body.documentDescription,
 					}
 				}
 			}, err => {
 				if (err) { return next(err); }
 				req.flash('success', { msg: 'Document successfully created.' });
 				res.redirect('/project/' + req.body.projectID);
 			})
 		}else{
 			req.flash('errors', { msg: 'Project not found' });
 			return res.redirect('/project/' + req.body.projectID);
 		}
 	})
 	// Document.findOne({ name: req.body.documentName, type:req.body.documentType}, (err, existingDoc) => {
 	// 	if (err) { return next(err); }
 	// 	if (existingDoc) {
 	// 		req.flash('errors', { msg: 'Document with the same name existed' });
 	// 		return res.redirect('/project/' + req.body.projectID);
 	// 	}
 	// 	doc.save((err, newDocument) => {
 	// 		if (err) { return next(err); }
 	// 		Project.findById({ _id: mongoose.Types.ObjectId(req.body.projectID)}, (err, project) => {
 	// 			if (err) { return next(err); } 
 	// 			project.document.push({ "docId" : newDocument._id, "name" : newDocument.name, "type" : newDocument.type });
 	// 			project.save((err) => {
 	// 				if (err) { return next(err); }
 	// 				req.flash('success', { msg: 'Document successfully created.' });
 	// 				res.redirect('/project/' + req.body.projectID);
 	// 			});
 	// 		});
 	// 	});
 	// });
 };

 /**
 * POST /doc/delete
 * Delete document.
 */
 exports.postDeleteDocument = (req, res, next) => {
 	Project.findOne({ _id: mongoose.Types.ObjectId(req.body.projectID) }, (err, project) => {
 		if (err) { return next(err); }
 		if (project) {
            // check user access right
            var accessRight = checkAccessRight(project, req.user.email);
            if (accessRight !== 'Admin') {
            	req.flash('errors', { msg: 'You need to have admin right to execute the action.' });
            	return res.redirect('/project/' + req.body.projectID);
            }
            Project.update({ _id: mongoose.Types.ObjectId(req.body.projectID)}, {"$pull": { "document": { "_id": mongoose.Types.ObjectId(req.body.documentID) }}}, (err, user) => {
            	if (err) { return next(err); }
            	req.flash('info', { msg: 'The document has been delete.' });
            	res.redirect('/project/' + req.body.projectID);
            });
        }else{
        	req.flash('errors', { msg: 'Project does not exists' });
        	return res.redirect('/project/' + req.body.projectID);
        }
    })
 };

 /**
 * POST /project/share
 * Share Project Access.
 */
 exports.postShareProjectAccess = (req, res, next) => {
    // find if project exists
    Project.findOne({ _id: mongoose.Types.ObjectId(req.body.projectID) }, (err, project) => {
    	if (err) { return next(err); }
    	if (project) {
            // check user access right
            var accessRight = checkAccessRight(project, req.user.email);
            if (accessRight !== 'Admin') { 		
            	req.flash('errors', { msg: 'You need to have admin right to execute the action.' });
            	return res.redirect('/project/' + req.body.projectID);
            }
			// check if this email address is in the access list
			for (var i = project.access.length - 1; i >= 0; i--) {
				if(project.access[i].emailAddress === req.body.emailAddress){
					req.flash('info', { msg: 'Email address already shared.' });
					return res.redirect('/project/'+ req.body.projectID);
				}
			}
			// find if email address exists in database
			User.findOne({ email: req.body.emailAddress }, (err, user) => {
				if (err) { return next(err); }
				if (user) {
					// update user project list
					user.project.push({ projectID:req.body.projectID });
					user.save((err) => {
						if (err) { return next(err); }
					});
					// add project access right
					Project.update({ _id: mongoose.Types.ObjectId(req.body.projectID)}, { 
						"$push": {
							"access": {
								name: user.profile.name,
								emailAddress: req.body.emailAddress,
								permission: req.body.permission,
							}
						}
					}, (err, user) => {
						if (err) { return next(err); }
						req.flash('success', { msg: 'Access right successfully shared.' });
						res.redirect('/project/' + req.body.projectID);
					});
				}else{
					req.flash('errors', { msg: 'User with this email address is not found.' });
					return res.redirect('/project/' + req.body.projectID);
				}
			});
		}else{
			req.flash('errors', { msg: 'Project does not exists' });
			return res.redirect('/project/' + req.body.projectID);
		}
	})
};

// return user access right on a particular project
function checkAccessRight(project, email) {
	for (var i = project.access.length - 1; i >= 0; i--) {
		if(project.access[i].emailAddress === email){
			if(project.access[i].permission === 'Admin'){
				return "Admin";
			}else if(project.access[i].permission === 'Write'){
				return "Write";
			}else if(project.access[i].permission === 'Read'){
				return "Read";
			}
		}
	}
}
