'use strict';

var Lab = require('lab');
var Promise = require('bluebird');
var lab = Lab.script();
var expect = Lab.expect;
var describe = lab.describe;
var before = lab.before;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var after = lab.after;
var it = lab.it;
var tracker = require('../lib/tracker');
var knex = require('knex');
var knexPackage = require('knex/package.json');

function noop() {}

describe('Mock DB : ', function mockKnexTests() {
  var db;
  var mod = require('../');

  mod.setAdapter('knex@' + knexPackage.version);

  describe('Module', function moduleTests() {
    it('should have a getTracker method', function getTrackerEntry(done) {
      expect(mod.getTracker).to.be.a('function');
      done();
    });

    it('should return an instance of the tracker', function returnsTracker(done) {
      expect(tracker).to.equal(mod.getTracker());
      done();
    });

    it('should have an mock method', function mockAdapterEntry(done) {
      expect(mod.mock).to.be.a('function');
      done();
    });

    it('should have an unmock method', function mockAdapterEntry(done) {
      expect(mod.unmock).to.be.a('function');
      done();
    });

    it('should revert a single adapter back to the original', function revertSingle(done) {
      var db = knex({
        dialect: 'sqlite3',
        connection: {
          filename: './data.db'
        }
      });

      mod.mock(db);

      expect(db._oldClient).to.be.a('object');

      mod.unmock(db);

      expect(db._oldClient).to.be.undefined;

      done();
    });
  });

  describe('Tracker', function trackerTests() {
    before(function beforeTracker(done) {
      db = knex({
        dialect: 'sqlite3',
        connection: {
          filename: './data.db'
        }
      });

      mod.mock(db);

      done();
    });

    it('should not track if not installed', function trackOnlyWhenInstalled(done) {
      db('users').select().then(noop);
      expect(tracker.queries.count()).to.equal(0);
      done();
    });

    it('should track if installed', function trackWhenInstalled(done) {
      tracker.install();

      tracker.once('query', function gotQuery(query) {
        expect(tracker.queries.count()).to.equal(1);
        tracker.uninstall();
        done();
      });

      db('users').select().then(noop);
    });

    it('uninstall should stop tracking', function trackWhenInstalled(done) {
      tracker.install();

      expect(tracker.tracking).to.equal(true);

      tracker.uninstall();

      expect(tracker.tracking).to.equal(false);

      done();
    });

    it('should return a query object with a response method',
    function queryHasResponse(done) {
      tracker.install();

      tracker.once('query', function gotQuery(query) {
        expect(query).to.have.property('response');
        expect(query.response).to.be.a('function');
        tracker.uninstall();
        done();
      });

      db('users').select().then(noop);
    });

    it('should return a query object with a method property',
    function queryHasMethod(done) {
      tracker.install();

      tracker.once('query', function gotQuery(query) {
        expect(query).to.have.property('method');
        expect(query.method).to.be.a('string');
        tracker.uninstall();
        done();
      });

      db('users').select().then(noop);
    });

    it('should return a query object with a bindings property',
    function queryHasBindings(done) {
      tracker.install();

      tracker.once('query', function gotQuery(query) {
        expect(query).to.have.property('bindings');
        expect(query.bindings).to.be.a('array');
        tracker.uninstall();
        done();
      });

      db('users').select().then(noop);
    });

    it('should return a query object with a sql property',
    function queryHasSql(done) {
      tracker.install();

      tracker.once('query', function gotQuery(query) {
        expect(query).to.have.property('sql');
        expect(query.sql).to.be.a('string');
        tracker.uninstall();
        done();
      });

      db('users').select().then(noop);
    });

    it('should be able to get the first query',
    function queryHasResponse(done) {
      tracker.install();

      tracker.on('query', function gotQuery(query, step) {
        query.index = step;

        if (step === 3) {
          expect(tracker.queries.first().index).to.equal(1);
          tracker.uninstall();
          done();
        }
      });

      db('users').select().then(noop);
      db('users').select().then(noop);
      db('users').select().then(noop);
    });

    it('should be able to get the last query',
    function queryHasResponse(done) {
      tracker.install();

      tracker.on('query', function gotQuery(query, step) {
        query.index = step;

        if (step === 3) {
          expect(tracker.queries.last().index).to.equal(3);
          tracker.uninstall();
          done();
        }
      });

      db('users').select().then(noop);
      db('users').select().then(noop);
      db('users').select().then(noop);
    });

    it('should be able to get a query at a specific step',
    function queryHasResponse(done) {
      tracker.install();

      tracker.on('query', function gotQuery(query, step) {
        query.index = step;

        if (step === 3) {
          expect(tracker.queries.step(2).index).to.equal(2);
          tracker.uninstall();
          done();
        }
      });

      db('users').select().then(noop);
      db('users').select().then(noop);
      db('users').select().then(noop);
    });

    it('should pass a step parameters to the query event',
    function queryHasResponse(done) {
      var index = 1;

      tracker.install();

      tracker.on('query', function gotQuery(query, step) {
        expect(step).to.equal(index);

        ++index;

        if (step === 3) {
          tracker.uninstall();
          done();
        }
      });

      db('users').select().then(noop);
      db('users').select().then(noop);
      db('users').select().then(noop);
    });

    it('should reply with the data passed to the query#response', function responseTest(done) {
      tracker.install();

      tracker.on('query', function checkResult(query) {
        query.response({ works : true });
      });

      db.select('field').from('table').then(function testResponse(result) {
        expect(result).to.be.a('object');
        expect(result.works).to.equal(true);
        done();
      });
    });

    describe('Knex', function knexTests() {
      beforeEach(function beforeEach(done) {
        tracker.install();
        done();
      });

      afterEach(function afterEach(done) {
        tracker.uninstall();
        done();
      });

      it('should support knex#first method with array response', function firstArrTest(done) {
        tracker.on('query', function checkResult(query) {
          expect(query.method).to.equal('first');
          query.response([
            {
              fielda : 'A',
              fieldb : 'B'
            },
            {
              fielda : 'C',
              fieldb : 'D'
            },
            {
              fielda : 'E',
              fieldb : 'F'
            }
          ]);
        });

        db.table('table').first('fielda', 'fieldb').then(function checkFirstArrResults(model) {
          expect(model.fielda).to.equal('A');
          expect(model.fieldb).to.equal('B');
          done();
        });
      });

      it('should support knex#first method with object response', function firstObjTest(done) {
        tracker.on('query', function checkResult(query) {
          expect(query.method).to.equal('first');
          query.response(
            {
              fielda : 'A',
              fieldb : 'B'
            }
          );
        });

        db.table('table').first('fielda', 'fieldb').then(function checkFirstArrResults(model) {
          expect(model.fielda).to.equal('A');
          expect(model.fieldb).to.equal('B');
          done();
        });
      });

      it('should support knex#pluck method with array response', function firstArrTest(done) {
        tracker.on('query', function checkResult(query) {
          expect(query.method).to.equal('pluck');
          query.response([
            {
              fielda : 'A',
              fieldb : 'B'
            },
            {
              fielda : 'C',
              fieldb : 'D'
            },
            {
              fielda : 'E',
              fieldb : 'F'
            }
          ]);
        });

        db.table('table').pluck('fielda').then(function checkFirstArrResults(arr) {
          expect(arr[0]).to.equal('A');
          expect(arr[1]).to.equal('C');
          expect(arr[2]).to.equal('E');
          done();
        });
      });

      it('should support knex#truncate method', function trunecateTest(done) {
        tracker.on('query', function checkResult(query) {
          expect(query.method).to.equal('truncate');
          done();
        });

        db.table('table').truncate().then(noop);
      });

      it('should support knex#del method', function deleteTest(done) {
        tracker.on('query', function checkResult(query) {
          expect(query.method).to.equal('del');
          done();
        });

        db.table('table').delete().then(noop);
      });

      it('should support knex#stream method', function streamTest(done) {
        tracker.on('query', function checkResult(query) {
          expect(query.method).to.equal('select');
          done();
        });

        var stream = db.select('columnA', 'columnB', 'columnC')
                       .from('field')
                       .where({
                         'columnA': true
                       })
                       .stream();
      });

      it('should catch errors on stream', function streamTest(done) {
        tracker.on('query', function checkResult(query) {
          throw new Error('Third Error');
        });

        var stream = db.select('columnA', 'columnB', 'columnC')
        .from('field')
        .where({
          'columnA': true
        })
        .stream(noop)
        .catch(function streamError(err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.equal('Third Error')
          done();
        });
      });

      it('should support transactions (commit)', function(done) {
        tracker.on('query', function checkResult(query, step) {
          var sql = query.sql.toLowerCase();

          if (query.method === 'insert') {
            return query.response(1);
          }

          switch (step) {
            case 1:
              expect(sql).to.contain('begin');
              query.response([]);
              break;

            case 6:
              expect(sql).to.contain('commit');
              query.response([]);
              break;
          }

          if (sql.indexOf('rollback') !== -1) {
            query.response([]);
          }
        });

        // Using trx as a transaction object:
        db.transaction(function(trx) {
          var books = [
            {title: 'Canterbury Tales'},
            {title: 'Moby Dick'},
            {title: 'Hamlet'}
          ];

          db.insert({name: 'Old Books'}, 'id')
            .into('catalogues')
            .transacting(trx)
            .then(function(ids) {
              return Promise.map(books, function(book) {
                book.catalogue_id = ids[0];

                return db.insert(book).into('books').transacting(trx);
              });
            }).then(trx.commit)
              .catch(trx.rollback);
          }).then(function(inserts) {
            expect(inserts.length).to.equal(3);
            done();
          }).catch(function(error) {
            done(error);
          });
      });

      it('should support transactions (rollback)', function(done) {
        tracker.on('query', function checkResult(query, step) {
          var sql = query.sql.toLowerCase();

          if (query.method === 'insert') {
            return query.response(1);
          }

          switch (step) {
            case 1:
              expect(sql).to.contain('begin');
              query.response([]);
              break;

            case 6:
              expect(sql).to.contain('commit');
              query.response([]);
              break;
          }

          if (sql.indexOf('rollback') !== -1) {
            query.response([]);
          }
        });

        // Using trx as a transaction object:
        db.transaction(function(trx) {
          var books = [
            {title: 'Canterbury Tales'},
            {title: 'Moby Dick'},
            {title: 'Hamlet'}
          ];

          db.insert({name: 'Old Books'}, 'id')
            .into('catalogues')
            .transacting(trx)
            .then(function(ids) {
              throw new Error('testing');

              return Promise.map(books, function(book) {
                book.catalogue_id = ids[0];

                return db.insert(book).into('books').transacting(trx);
              });
            }).then(trx.commit)
              .catch(trx.rollback);
          }).then(function(inserts) {
            expect(inserts.length).to.equal(3);
            done('transaction should have failed');
          }).catch(function(error) {
            done();
          });
      });
  });

    describe('Bookshelf', function bookshelfTests() {
      var Model;
      var Collection;

      before(function before(done) {
        var bookshelf = require('bookshelf')(db);

        Model = bookshelf.Model.extend({
          tableName : 'models'
        });

        Collection = bookshelf.Collection.extend({
          model : Model
        });

        done();
      });

      beforeEach(function beforeEach(done) {
        tracker.install();
        done();
      });

      afterEach(function afterEach(done) {
        tracker.uninstall();
        done();
      });

      describe('Models', function modelTests() {
        it('should work with Model#fetch', function modelFetchTest(done) {
          tracker.on('query', function sendResult(query) {
            query.response([
              {
                id : 1,
                foo : 'bar'
              }
            ]);
          });

          Model.forge({ id : 1 }).fetch()
               .then(function fetchResult(model) {
                 expect(model).to.be.an.instanceof(Model);
                 expect(model.get('id')).to.equal(1);
                 expect(model.get('foo')).to.equal('bar');
                 done();
               });
        });

        it('should work with Model#fetchAll', function modelFetchAllTest(done) {
          tracker.on('query', function sendResult(query) {
            query.response([
              {
                id : 1,
                foo : 'bar'
              },
              {
                id : 2,
                foo : 'baz'
              }
            ]);
          });

          Model.forge({ id : 1 }).fetchAll()
            .then(function fetchAllResult(collection) {
              expect(collection.length).to.equal(2);
              expect(collection.models[0].get('foo')).to.equal('bar');
              expect(collection.models[1].get('foo')).to.equal('baz');

              done();
            });
        });

        it('should work with Model#save on updates', function modelsaveUpdateTest(done) {
          tracker.on('query', function sendResult(query) {
            expect(query.method).to.equal('update');
            expect(query.bindings).to.include('bar');
            expect(query.bindings).to.include(10);
            done();
          });

          Model.forge({ id : 10, foo : 'bar' }).save();
        });

        it('should work with Model#save on inserts', function modelSaveInsertTest(done) {
          tracker.on('query', function sendResult(query) {
            expect(query.method).to.equal('insert');
            expect(query.bindings).to.include('bar');
            done();
          });

          Model.forge({ foo : 'bar' }).save();
        });

        it('should work with Model#destroy', function modelDestroyTest(done) {
          tracker.on('query', function sendResult(query) {
            expect(query.method).to.equal('del');
            done();
          });

          Model.forge({ id : 1, foo : 'bar' }).destroy();
        });
      });

      describe('Collections', function collectionTests() {
        it('should work with Collection#fetch method', function collFetchTest(done) {
          tracker.on('query', function sendResult(query) {
            query.response([
              {
                id : 1,
                foo : 'bar'
              },
              {
                id : 2,
                foo : 'baz'
              }
            ]);
          });

          Collection.forge().fetch()
                            .then(function fetchResult(collection) {
                              expect(collection.length).to.equal(2);
                              expect(collection.models[0].get('foo')).to.equal('bar');
                              expect(collection.models[1].get('foo')).to.equal('baz');

                              done();
                            });
        });

        it('should work with Collection#fetchOne method', function collFetchOne(done) {
          tracker.on('query', function sendResult(query) {
            expect(query.bindings[0]).to.equal(2);
            expect(query.bindings[1]).to.equal(1);

            done();
          });

          Collection.forge().query({
            where : {
              id : 2
            }
          }).fetchOne();
        });
      });
    });
  });
});

module.exports.lab = lab;
