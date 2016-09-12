import _ from 'lodash';
import Promise from 'bluebird';
import {
  describe,
  expect,
  before,
  beforeEach,
  afterEach,
  after,
  it,
  mod,
  tracker,
  Bookshelf,
  MockSymbol,
} from './';

export default (db, extra) => {
  describe('Knex', () => {
    before((done) => {
      mod.mock(db);
      done();
    });

    after((done) => {
      mod.unmock(db);
      done();
    })

    beforeEach((done) => {
      tracker.install();
      done();
    });

    afterEach((done) => {
      tracker.uninstall();
      done();
    });

    it('should support knex#Raw', (done) => {
      tracker.on('query', (query) => {
        expect(query.method).to.equal('raw');
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

      db.raw('SELECT fielda, fieldb FROM test-table;').then((rows) => {
        expect(rows).to.be.a('array');
        expect(rows[0]).to.be.a('object');
        expect(rows[1]).to.be.a('object');
        expect(rows[2]).to.be.a('object');
        expect(rows[0].fielda).to.equal('A');
        expect(rows[1].fielda).to.equal('C');
        expect(rows[2].fielda).to.equal('E');
        done();
      });
    });

    it('should support knex#first method with array response', (done) => {
      tracker.on('query', (query) => {
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

      db.table('test-table').first('fielda', 'fieldb').then((model) => {
        expect(model.fielda).to.equal('A');
        expect(model.fieldb).to.equal('B');
        done();
      });
    });

    it('should support knex#count', (done) => {
      tracker.on('query', (query) => {
        expect(query.method).to.equal('select');

        query.response({
          count : 10,
        });
      });

      db.table('test-table').count().then((model) => {
        expect(model).to.be.a('object');
        expect(model.count).to.equal(10);
        done();
      });
    });

    it('should support knex#first method with object response', (done) => {
      tracker.on('query', (query) => {
        expect(query.method).to.equal('first');
        query.response(
          {
            fielda : 'A',
            fieldb : 'B'
          }
        );
      });

      db.table('test-table').first('fielda', 'fieldb').then((model) => {
        expect(model.fielda).to.equal('A');
        expect(model.fieldb).to.equal('B');
        done();
      });
    });

    it('should support knex#pluck method with array response', (done) => {
      tracker.on('query', (query) => {
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

      db.table('test-table').pluck('fielda').then((arr) => {
        expect(arr[0]).to.equal('A');
        expect(arr[1]).to.equal('C');
        expect(arr[2]).to.equal('E');
        done();
      });
    });

    it('should support knex#truncate method', (done) => {
      tracker.on('query', (query) => {
        expect(query.method).to.equal('truncate');
        done();
      });

      db.table('test-table').truncate().then(_.noop);
    });

    it('should support knex#del method', (done) => {
      tracker.on('query', (query) => {
        expect(query.method).to.equal('del');
        done();
      });

      db.table('test-table').delete().then(_.noop);
    });

    it('should support knex#stream method', (done) => {
      tracker.on('query', (query) => {
        expect(query.method).to.equal('select');
        query.response([
          {
            columnA : true,
            columnB : 'testing',
            columnC : 1,
          },
        ], {
          stream : true,
        });
      });

      var stream = db.select('columnA', 'columnB', 'columnC')
                     .from('field')
                     .where({
                       'columnA': true
                     })
                     .stream();

      stream.on('data', (result) => {
        expect(result).to.be.a('object');
        expect(result.columnC).to.equal(1);
        expect(result.columnB).to.equal('testing');
        expect(result.columnA).to.equal(true);
        done();
      });
    });

    it('should catch errors on stream', (done) => {
      tracker.on('query', (query) => {
        throw new Error('Third Error');
      });

      var stream = db.select('columnA', 'columnB', 'columnC')
      .from('field')
      .where({
        'columnA': true
      })
      .stream(_.noop)
      .catch((err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal('Third Error')
        done();
      });
    });

    it('should support transactions (commit)', (done) => {
      tracker.on('query', (query, step) => {
        var sql = query.sql.toLowerCase();

        expect(query.transacting).to.be.true;

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
      db.transaction((trx) => {
        var books = [
          {title: 'Canterbury Tales'},
          {title: 'Moby Dick'},
          {title: 'Hamlet'}
        ];

        db.insert({name: 'Old Books'}, 'id')
          .into('catalogues')
          .transacting(trx)
          .then((ids) => {
            return Promise.map(books, (book) => {
              book.catalogue_id = ids[0];

              return db.insert(book).into('books').transacting(trx);
            });
          }).then(trx.commit)
            .catch(trx.rollback);
        }).then((inserts) => {
          expect(inserts.length).to.equal(3);
          done();
        }).catch((error) => {
          done(error);
        });
    });

    it('should support transactions (rollback)', (done) => {
      tracker.on('query', (query, step) => {
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
      db.transaction((trx) => {
        var books = [
          {title: 'Canterbury Tales'},
          {title: 'Moby Dick'},
          {title: 'Hamlet'}
        ];

        db.insert({name: 'Old Books'}, 'id')
          .into('catalogues')
          .transacting(trx)
          .then((ids) => {
            throw new Error('testing');

            return Promise.map(books, (book) => {
              book.catalogue_id = ids[0];

              return db.insert(book).into('books').transacting(trx);
            });
          }).then(trx.commit)
            .catch(trx.rollback);
        }).then((inserts) => {
          expect(inserts.length).to.equal(3);
          done('transaction should have failed');
        }).catch((error) => {
          done();
        });
    });

    if (extra.knex) {
      extra.knex(db);
    }
  });
};
