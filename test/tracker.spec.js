'use strict';

var Lab = require('lab');
var lab = Lab.script();
var expect = Lab.expect;
var describe = lab.describe;
var before = lab.before;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var after = lab.after;
var it = lab.it;
var tracker = require('../lib/tracker');
var _ = require('lodash');
var knex = require('knex');

function noop() {}

describe('Mock DB : ', function mockKnexTests() {
  var db;
  var mod = require('../');

  describe('Module', function moduleTests() {
    it('should have a getTracker method', function getTrackerEntry(done) {
      expect(mod.getTracker).to.be.a('function');
      done();
    });

    it('should return an instance of the tracker', function returnsTracker(done) {
      expect(tracker).to.equal(mod.getTracker());
      done();
    });

    it('should have a knex property', function mockAdapterEntry(done) {
      expect(mod.knex).to.be.a('object');
      done();
    });

    it('should have a knex#instlal method', function mockAdapterEntry(done) {
      expect(mod.knex.install).to.be.a('function');
      done();
    });

    it('should mock an adapter when called with a name', function mockSingleAdapter(done) {
      mod.knex.install('sqlite3');

      expect(knex.Clients.sqlite3.name).to.equal('mockedKnex');
      expect(knex.Clients.pg.name).to.not.equal('mockedKnex');

      mod.knex.uninstall();

      done();
    });

    it('should mock an adapter when called with an array of names', function mockSingleAdapter(done) {
      mod.knex.install(['sqlite3', 'mysql', 'websql']);

      expect(knex.Clients.sqlite3.name).to.equal('mockedKnex');
      expect(knex.Clients.mysql.name).to.equal('mockedKnex');
      expect(knex.Clients.websql.name).to.equal('mockedKnex');
      expect(knex.Clients.pg.name).to.not.equal('mockedKnex');

      mod.knex.uninstall();

      done();
    });

    it('should mock all adapters when called without a name', function mockAllAdapter(done) {
      var clients = mod.knex.install();

      Object.keys(knex.Clients).forEach(function checkClient(name) {
        expect(knex.Clients[ name ].name).to.equal('mockedKnex');
      });

      mod.knex.uninstall();

      Object.keys(knex.Clients).forEach(function checkClient(name) {
        expect(knex.Clients[ name ].name).to.not.equal('mockedKnex');
      });

      done();
    });

    it('should have a knex#uninstlal method', function mockAdapterEntry(done) {
      expect(mod.knex.uninstall).to.be.a('function');
      done();
    });

    it('should revert a single adapter back to the original', function revertSingle(done) {
      mod.knex.install('sqlite3');

      expect(knex.Clients.sqlite3.name).to.equal('mockedKnex');

      mod.knex.uninstall();

      expect(knex.Clients.sqlite3.name).to.not.equal('mockedKnex');

      done();
    });

    it('should revert all adapter back to the original', function revertSingle(done) {
      mod.knex.install();

      Object.keys(knex.Clients).forEach(function loopModified(client) {
        expect(knex.Clients[ client ].name).to.equal('mockedKnex');
      });

      mod.knex.uninstall();

      Object.keys(knex.Clients).forEach(function loopModified(client) {
        expect(knex.Clients[ client ].name).to.not.equal('mockedKnex');
      });

      done();
    });

    after(function afterModule(done) {
      mod.knex.uninstall();
      done();
    });
  });

  describe('Tracker', function trackerTests() {
    before(function beforeTracker(done) {
      mod.knex.install('sqlite3');

      db = knex({
        client : 'sqlite3'
      });

      done();
    });

    after(function afterTracker(done) {
      mod.knex.uninstall();
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
      var index = 0;

      tracker.install();

      tracker.on('query', function gotQuery(query) {
        query.index = index;

        if (index === 2) {
          expect(tracker.queries.first().index).to.equal(0);
          tracker.uninstall();
          done();
        }

        ++index;
      });

      db('users').select().then(noop);
      db('users').select().then(noop);
      db('users').select().then(noop);
    });

    it('should be able to get the last query',
    function queryHasResponse(done) {
      var index = 0;

      tracker.install();

      tracker.on('query', function gotQuery(query) {
        query.index = index;

        if (index === 2) {
          expect(tracker.queries.last().index).to.equal(2);
          tracker.uninstall();
          done();
        }

        ++index;
      });

      db('users').select().then(noop);
      db('users').select().then(noop);
      db('users').select().then(noop);
    });

    it('should be able to get a query at a specific index',
    function queryHasResponse(done) {
      var index = 0;

      tracker.install();

      tracker.on('query', function gotQuery(query) {
        query.index = index;

        if (index === 2) {
          expect(tracker.queries.at(1).index).to.equal(1);
          tracker.uninstall();
          done();
        }

        ++index;
      });

      db('users').select().then(noop);
      db('users').select().then(noop);
      db('users').select().then(noop);
    });

    it('should call the callback when a response is given', function selectTest1(done) {
      tracker.install();

      tracker.on('query', function checkResult(query) {
        query.response();
      });

      db.select('field').from('table').then(done);
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
