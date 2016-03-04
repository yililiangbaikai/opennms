'use strict';

Number.prototype.padLeft = function (n,str){
	return Array(n-String(this).length+1).join(str||'0')+this;
}

var moment = require('moment');

var defaultOptions = {
	url: 'http://localhost:8980/opennms',
	username: 'admin',
	password: 'admin'
};

function extend(target, source) {
	for (var key in source) {
		if (!target.hasOwnProperty(key)) {
			target[key] = source[key];
		}
	}
	return target;
}

function OpenNMS(casper, options) {
	this.casper = casper;
	this._options = options || {};
	extend(this._options, defaultOptions);
	this.casper.options.retryTimeout = 50;
	this.casper.options.waitTimeout = 10000;
	this.casper.options.onResourceRequested = function(c, requestData, networkRequest) {
		if (requestData.url.indexOf('/rest/') >= 0) {
			if (!requestData.headers.Accept) {
				//console.log('* Setting Accept header to application/json on request ' + requestData.url);
				networkRequest.setHeader('Accept', 'application/json');
			}
		}
	};
}

OpenNMS.prototype.initialize = function() {
	var self = this;
	self.configureViewport();
	self.configureLogging();
	self.enableScreenshots();
};

OpenNMS.prototype.configureLogging = function() {
	var self = this;
	if (!self.casper._loggingConfigured) {
		self.casper.on('remote.message', function(message) {
			if (message) {
				message.trim().split(/[\r\n]+/).map(function(line) {
					if (line.indexOf('com.vaadin.client.VConsole') < 0) {
						//console.log('console: ' + line);
					}
				});
			}
		});
		self.casper._loggingConfigured = true;
	}
};

OpenNMS.prototype.configureViewport = function() {
	var self = this;
	self.casper.options.viewportSize = {
		width: 1920,
		height: 1024
	};
};

var cleanText = function(text) {
	return text.replace(/[^A-Za-z0-9]+/gm, '-').replace(/^\-/, '').replace(/\-$/, '').toLowerCase();
};

OpenNMS.prototype.enableScreenshots = function() {
	var self = this;

	if (!self.casper.hasOwnProperty('_screenshotNumber')) {
		self.casper._screenshotNumber = 1;
	}

	var takeScreenshot = function(filename) {
		self.casper.capture('target/screenshots/' + self.casper._screenshotNumber.padLeft(3) + '-' + filename);
		self.casper._screenshotNumber++;
	};

	self.casper.options.onWaitTimeout = function() {
		//console.log('wait timeout: ' + JSON.stringify(Array.prototype.slice.call(arguments)));
		if (arguments[1].text) {
			takeScreenshot('timeout-wait-' + cleanText(arguments[1].text) + '.png');
		} else if (arguments[1].selector) {
			takeScreenshot('timeout-wait-' + cleanText(arguments[1].selector) + '.png');
		} else {
			takeScreenshot('timeout-wait.png');
		}
	};
	self.casper.options.onTimeout = function() {
		//console.log('timeout: ' + JSON.stringify(Array.prototype.slice.call(arguments)));
		if (arguments[1].text) {
			takeScreenshot('timeout-' + cleanText(arguments[1].text) + '.png');
		} else if (arguments[1].selector) {
			takeScreenshot('timeout-' + cleanText(arguments[1].selector) + '.png');
		} else {
			takeScreenshot('timeout.png');
		}
	};
	self.casper.options.onStepTimeout = function() {
		//console.log('step timeout: ' + JSON.stringify(Array.prototype.slice.call(arguments)));
		if (arguments[1].text) {
			takeScreenshot('timeout-step-' + cleanText(arguments[1].text) + '.png');
		} else if (arguments[1].selector) {
			takeScreenshot('timeout-step-' + cleanText(arguments[1].selector) + '.png');
		} else {
			takeScreenshot('timeout-step.png');
		}
	};
	if (!self.casper._screenshotsEnabled) {
		self.casper.test.on('fail', function(failure) {
			//console.log('error: ' + JSON.stringify(failure));
			var message, file;
			if (failure && typeof failure.message === 'string' || failure.message instanceof String) {
				message = cleanText(failure.message);
			}
			if (failure && failure.file && failure.file.indexOf('src/test/javascript/tests') === 0) {
				file = cleanText(failure.file.replace('src/test/javascript/tests/', '').replace(/.js$/, ''));
			}
			if (!message && !file) {
				console.log('OpenNMS.enableScreenshots: unsure how to handle failure: ' + JSON.stringify(failure));
			} else {
				var outfile = message + '.png';
				if (file) {
					outfile = file + '-' + outfile;
				}
				takeScreenshot(outfile);
			}
		});
		self.casper._screenshotsEnabled = true;
	}
};

OpenNMS.prototype.start = function start() {
	if (!self.casper._started) {
		self.casper.start();
		self.casper._started = true;
	}
};

OpenNMS.prototype.login = function login() {
	var self = this;

	console.log('* Filling OpenNMS login form.');
	var options = self.options();

	self.start();

	var url = self.root() + '/login.jsp';
	//console.log('opening URL: ' + url);
	self.casper.thenOpen(self.root() + '/login.jsp');
	self.casper.then(function() {
		this.fill('form', {
			j_username: options.username,
			j_password: options.password
		}, false);
	});
	self.casper.then(function() {
		self.casper.clickLabel('Login');
	});
	self.enableBasicAuth();
	self.casper.thenOpen(self.root());
	self.casper.waitForSelector('ol.breadcrumb > li > a[href="'+self.root()+'/index.jsp"]', function() {
		console.log('* Finished logging in.');
	});
}

OpenNMS.prototype.enableBasicAuth = function(username, password) {
	var self = this;
	var options = self.options();

	if (!username) {
		username = options.username;
	}
	if (!password) {
		password = options.password;
	}

	self.casper.then(function() {
		this.setHttpAuth(username, password);
	});
}

OpenNMS.prototype.logout = function() {
	var self = this;
	self.casper.thenOpen(self.root() + '/j_spring_security_logout');
	delete self.casper._started;
};

OpenNMS.prototype.options = function() {
	return extend({}, this._options);
};

OpenNMS.prototype.root = function() {
	return this.options().url;
};

OpenNMS.prototype.finished = function(test) {
	var self = this;
	self.logout();
	self.casper.run(function() {
		setTimeout(function() {
			test.done();
		},0);
	});
};

OpenNMS.prototype.createOrReplaceRequisition = function(foreignSource, obj) {
	var self = this;

	self.casper.thenOpen(self.root() + '/rest/requisitions', {
		method: 'post',
		data: obj || {'foreign-source': foreignSource},
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}
	}, function(response) {
		if (response.status !== 200) {
			console.log('OpenNMS.createOrReplaceRequisition: unexpected response: ' + JSON.stringify(response));
			throw new CasperError('POST of requisition ' + foreignSource + ' should return success.');
		}
	});
	self.casper.back();
};

OpenNMS.prototype.fetchRequisition = function(foreignSource) {
	var self = this;

	self.casper.thenOpen(self.root() + '/rest/requisitions/' + foreignSource, {
		headers: {
			Accept: 'application/json'
		}
	});
};

OpenNMS.prototype.assertRequisitionImported = function(foreignSource) {
	var self = this;

	self.casper.thenOpen(self.root() + '/rest/requisitions/' + foreignSource, {
		headers: {
			Accept: 'application/json'
		}
	}, function(response) {
		if (response.status !== 200) {
			console.log('OpenNMS.assertRequisitionImported: unexpected response: ' + JSON.stringify(response));
			throw new CasperError('GET of requisition ' + foreignSource + ' should return success.');
		}
	});
	self.casper.then(function() {
		var requisition = JSON.parse(this.getPageContent());
		if (requisition['date-stamp'] > requisition['last-import']) {
			throw new CasperError('Requisition ' + foreignSource + ' has not yet been imported since it was last modified!');
		}
	});
	self.casper.back();
};

OpenNMS.prototype.assertRequisitionExists = function(foreignSource, numNodes) {
	var self = this;

	var startingUrl = self.casper.getCurrentUrl();
	self.casper.thenOpen(self.root() + '/rest/requisitions/' + foreignSource);

	var to = setTimeout(function() {
		self.casper.thenOpen(self.root() + '/rest/requisitions/' + foreignSource);
	}, 500);

	var expected = '"foreign-source": "' + foreignSource + '"';
	self.casper.waitForText(expected, function() {
		var contents = this.getPageContent();
		if (contents.indexOf(expected) >= 0) {
			var requisition = JSON.parse(contents);
			if (numNodes !== undefined && numNodes !== requisition.count) {
				throw new CasperError('Requisition ' + foreignSource + ' exists, but only has ' + requisition.count + ' nodes! (' + numNodes + ' expected)');
			}
		} else {
			throw new CasperError('Requisition ' + foreignSource + ' never returned a valid JSON response.');
		}
	});
	self.casper.then(function() {
		clearTimeout(to);
	});
	self.casper.thenOpen(startingUrl);
};

OpenNMS.prototype.importRequisition = function(foreignSource) {
	var self = this;

	self.casper.thenOpen(self.root() + '/rest/requisitions/' + foreignSource + '/import', {
		method: 'put',
		headers: {
			'Content-Type': 'application/json',
			Accept: '*/*'
		}
	}, function(response) {
		if (response.status !== 415) {
			console.log('OpeNNMS.importRequisition: unexpected response: ' + JSON.stringify(response));
			throw new CasperError('(sigh) import of requisition ' + foreignSource + ' redirects to a page that eventually gives a 415 error.');
		}
	});
	self.casper.back();
};

OpenNMS.prototype.deleteRequisition = function(foreignSource) {
	var self = this;

	self.casper.thenOpen(self.root() + '/rest/requisitions/' + foreignSource, {
		method: 'delete'
	}, function(response) {
		if (response.status !== 200) {
			console.log('OpenNMS.deleteRequisition: unexpected response: ' + JSON.stringify(response));
			throw new CasperError('DELETE of requisition ' + foreignSource + ' should return success.');
		}
	});
	self.casper.thenOpen(self.root() + '/rest/requisitions/deployed/' + foreignSource, {
		method: 'delete'
	}, function(response) {
		if (response.status !== 200) {
			console.log('OpenNMS.deleteRequisition: unexpected response: ' + JSON.stringify(response));
			throw new CasperError('DELETE of requisition ' + foreignSource + ' should return success.');
		}
	});
	self.casper.back();
};

OpenNMS.prototype.waitForRequisition = function(foreignSource, numNodes) {
	var self = this;
	var startingUrl = self.casper.getCurrentUrl();
	self.assertRequisitionExists(foreignSource, numNodes);

	var expected = '"foreign-source": "' + foreignSource + '"';
	self.casper.thenOpen(self.root() + '/rest/requisitions/' + foreignSource);
	var to = setTimeout(function() {
		self.casper.thenOpen(self.root() + '/rest/requisitions/' + foreignSource);
	}, 500);
	console.log('* Waiting for ' + foreignSource + ' requisition to exist and be deployed.');
	self.casper.waitFor(function check() {
		var ret = false;
		var content = self.casper.getPageContent();
		if (content.indexOf(expected) >= 0) {
			var requisition = JSON.parse(content);
			if (numNodes && numNodes !== requisition.node.length) {
				//console.log('! Requisition ' + foreignSource + ' exists, but has the wrong number of nodes! (' + requisition.node.length + ' != ' + numNodes + ')');
				ret = false;
			} else {
				if (requisition['date-stamp'] > requisition['last-import']) {
					//console.log('! Requisition ' + foreignSource + ' exists, but has not finished importing.');
					ret = true;
				} else {
					//console.log('* Requisition ' + foreignSource + ' has finished importing.');
					ret = true;
				}
			}
		}
		return ret;
	}, function then() {
		clearTimeout(to);

		self.casper.thenOpen(self.root() + '/rest/nodes/?foreignSource=' + foreignSource);
		to = setTimeout(function() {
			self.casper.thenOpen(self.root() + '/rest/nodes/?foreignSource=' + foreignSource);
		}, 500);
		self.casper.waitFor(function checkNodes() {
			var ret = false;
			var content = self.casper.getPageContent();
			if (content.indexOf('"foreignSource": "' + foreignSource + '"') >= 0) {
				var node = JSON.parse(content);
				if (numNodes !== undefined && node.count !== numNodes) {
					//console.log('! Requisition ' + foreignSource + ' does not have the required number of nodes in the database. (' + node.count + ' != ' + numNodes + ')');
					ret = false;
				} else {
					//console.log('* Requisition ' + foreignSource + ' has finished importing.');
					ret = true;
				}
			} else {
				ret = false;
			}
		});
		self.casper.thenOpen(startingUrl);
	});
	self.casper.then(function() {
		console.log('* ' + foreignSource + ' has been deployed.');
	});
	self.casper.wait(500);
	self.casper.thenOpen(startingUrl);
};

OpenNMS.prototype.wipeRequisition = function(foreignSource) {
	var self = this;

	var wipeLog = function(text) {
		self.casper.echo('OpenNMS.wipeRequisition: ' + text, 'INFO');
	}

	self.casper.then(function() {
		wipeLog('clearing ' + foreignSource);
		self.createOrReplaceRequisition(foreignSource);
	});
	self.casper.wait(500);
	self.casper.then(function() {
		wipeLog('importing empty ' + foreignSource);
		self.importRequisition(foreignSource);
	});
	self.waitForRequisition(foreignSource);
	self.casper.then(function() {
		wipeLog('deleting ' + foreignSource);
		self.deleteRequisition(foreignSource);
	});
	self.casper.wait(500);
};

OpenNMS.prototype.ensureNoRequisitions = function() {
	var self = this;

	self.casper.thenOpen(self.root() + '/rest/requisitions', {
		headers: {
			Accept: 'application/json'
		}
	});

	self.casper.then(function() {
		var content = this.getPageContent();
		if (content.indexOf('"model-import"') < 0) {
			console.log('OpenNMS.ensureNoRequisitions: Unexpected content: ' + content);
			throw new CasperError('"model-import" JSON field should be found');
		}
		var requisition = JSON.parse(this.getPageContent());
		if (requisition.count > 0) {
			for (var i=0; i < requisition.count; i++) {
				var foreignSource = requisition['model-import'][i]['foreign-source'];
				self.wipeRequisition(foreignSource);
			}
		}
	});
};

OpenNMS.prototype.createEvent = function(ev) {
	// $week[$wday], $mday $month[$month] $year $hour:$min:$sec o'clock $ZONE
	var self = this,
		now = moment.utc().format('dddd, DD MMMM YYYY HH:mm:ss [o\'clock] UTC');

	if (!ev) {
		throw new CasperError('No event!');
	}
	if (!ev.uei) {
		throw new CasperError('Event is missing UEI!');
	}
	if (!ev.time) {
		ev.time = now;
	}
	if (!ev.creationTime) {
		ev['creation-time'] = now;
	}
	if (!ev.source) {
		ev.source = 'SmokeTests';
	}
	self.casper.thenOpen(self.root() + '/rest/events', {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/xml'
		},
		data: ev
	}, function(response) {
		if (response.status !== 200) {
			console.log('* OpenNMS.createEvent: unexpected response: ' + JSON.stringify(response));
			throw new CasperError('Creation of event ' + ev.uei + ' failed.');
		}
	});
	self.casper.then(function() {
		self.casper.back();
	});
};

OpenNMS.prototype.scrollToElementWithText = function(type, text) {
	var self = this;

	self.casper.thenEvaluate(function(type, text) {
		console.log('* Scrolling to "'+type+'" element with text "'+text+'"');
		var elements = document.getElementsByTagName('span');
		var element;
		for (var i=0; i < elements.length; i++) {
			if (elements[i].textContent === text) {
				element = elements[i];
				break;
			}
		}
		if (element) {
			element.scrollIntoView({
				behavior: 'instant'
			});
		} else {
			console.log('! Failed to find element.');
		}
	}, type, text);
};

module.exports = function(casper, options) {
	return new OpenNMS(casper, options);
}