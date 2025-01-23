import vem_server.common as common
import vem_server.models as models
from itertools import islice
import mysql.connector.pooling as pooling
import time
import yaml
import os


class DBProvider:
    def __init__(self):
        self.init_db()

        for data_class in common.list_subclasses("vem_server.models", models.DataObject):
            if data_class.__store__:
                self.register_object(data_class)

    def init_db(self):
        pass

    def register_object(self, data_class):
        pass

    def exists_in_db_with_id(self, data_class, oid):
        pass

    def exist_in_db_with_ids(self, data_class, oids):
        pass

    def save_to_db(self, in_object):
        pass

    def delete_from_db_by_id(self, data_class, oid):
        pass

    def delete_from_db_by_ids(self, data_class, oids):
        pass

    def load_from_db_by_id(self, data_class, oid):
        pass

    def load_from_db_by_data(self, data_class, **kwargs):
        pass

    def list_from_db(self, data_class, num=0, columns=None):
        pass


class MySQL (DBProvider):
    class SQLConnectionManager:
        def __init__(self, pool):
            self.pool = pool

        def __enter__(self):
            self.connection = self.pool.get_connection()
            self.cursor = self.connection.cursor()
            return self.connection, self.cursor

        def __exit__(self, exc_type, exc_val, exc_tb):
            self.cursor.close()
            self.connection.close()

    def __init__(self, host=None, user=None, password=None, database=None):
        self.host = host if host else os.getenv("DB_ENDPOINT", "127.0.0.1")
        self.user = user if user else os.getenv("DB_USER", "root")
        self.password = password if password else os.getenv("DB_PASSWORD", "test-123")
        self.database = database if database else os.getenv("DB_DATABASE", "vem")

        self.connection_manager = self.SQLConnectionManager(pooling.MySQLConnectionPool(pool_name=f"pool-{common.secure_name(str(time.time()))[:4]}", pool_size=int(os.getenv("DB_CONNECTIONS", 5)), pool_reset_session=True, host=self.host, user=self.user, password=self.password, database=self.database))

        super().__init__()

    def init_db(self):
        try:
            with self.connection_manager as cm:
                connection, cursor = cm
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database};")
        except Exception as e:
            common.logger.error(str(e))

    def drop(self):
        try:
            with self.connection_manager as cm:
                connection, cursor = cm
                cursor.execute(f"DROP DATABASE {self.database};")
        except Exception as e:
            common.logger.error(str(e))

    def register_object(self, data_class):
        try:
            with self.connection_manager as cm:
                connection, cursor = cm
                cursor.execute(f"CREATE TABLE IF NOT EXISTS {data_class.table} ({self.schema2str(data_class)})")
        except Exception as e:
            common.logger.error(str(e))

    @staticmethod
    def iter2str(iterable):
        return ", ".join(iterable)

    def schema2str(self, data_class):
        return self.iter2str(map(lambda x: x[0] + " " + x[1], data_class.schema.items()))

    def schema2keys(self, data_class):
        return self.iter2str(data_class.schema.keys())

    def schema2vals(self, data_class):
        return self.iter2str(["%s"] * len(data_class.schema))

    @staticmethod
    def where(query):
        return f"WHERE {query}"

    @staticmethod
    def _and(queries):
        if isinstance(queries, str):
            return queries
        return " AND ".join(queries)

    @staticmethod
    def _or(queries):
        return " OR ".join(queries)

    @staticmethod
    def _in(name, values):
        val = ', '.join(map(lambda v: v if not isinstance(v, str) else f"'{v}'", values))
        return f"{name} IN ({val})"

    @staticmethod
    def _eq(name, value):
        val = value if not isinstance(value, str) else f"'{value}'"
        return f"{name} = {val}"

    def _queries(self, op=None, **kwargs):
        if op is None:
            op = self._eq
        queries = [op(k, val) for k, val in kwargs.items()]
        return queries if len(queries) > 1 else queries[0]

    def exists_in_db_with_id(self, data_class, oid):
        return self.load_from_db_one(data_class, query=self.where(self._queries(id=oid)), columns=["id"]) is not None

    def exist_in_db_with_ids(self, data_class, oids):
        result = self.load_from_db_multiple(data_class, query=self.where(self._queries(op=self._in, id=oids)), columns=["id"])
        return result is not None and len(result) == len(oids)

    def save_to_db(self, in_object):
        with self.connection_manager as cm:
            connection, crs = cm
            crs.execute(f"REPLACE INTO {in_object.table} ({self.schema2keys(in_object)}) VALUES ({self.schema2vals(in_object)})", in_object.get_repr())
            connection.commit()

    def delete_from_db(self, data_class, query):
        with self.connection_manager as cm:
            connection, crs = cm
            crs.execute(f"DELETE FROM {data_class.table} {query}")
            connection.commit()

    def delete_from_db_by_id(self, data_class, oid):
        self.delete_from_db(data_class, self.where(self._queries(id=oid)))

    def delete_from_db_by_ids(self, data_class, oids):
        self.delete_from_db(data_class, self.where(self._queries(op=self._in, id=oids)))

    def load_from_db(self, data_class, query="", num=None, columns=None):
        with self.connection_manager as cm:
            connection, crs = cm
            crs.execute(f"SELECT {'*' if columns is None else self.iter2str(columns)} FROM {data_class.table} {query}") if query != "" else crs.execute(f"SELECT {'*' if columns is None else self.iter2str(columns)} FROM {data_class.table}")

            if num is None:
                values = crs.fetchone()
            elif num == 0:
                values = crs.fetchall()
            else:
                values = crs.fetchmany(num)

        return values

    def load_from_db_one(self, data_class, query, columns=None):
        values = self.load_from_db(data_class, query, columns=columns)

        if values is None:
            return None

        if columns is not None:

            params = dict()
            for i in range(len(columns)):
                params[columns[i]] = values[i]

            return params

        params = dict()
        for ind, k in enumerate(data_class.schema.keys()):
            params[k] = values[ind]

        return data_class(**params)

    def load_from_db_multiple(self, data_class, query="", num=0, columns=None):
        values = self.load_from_db(data_class, query, num, columns)

        if values is None:
            return None

        if columns is not None:
            items = list()

            for v in values:
                params = dict()
                for i in range(len(columns)):
                    params[columns[i]] = v[i]

                items.append(params)

            return items

        items = list()

        for v in values:
            params = dict()
            for ind, k in enumerate(data_class.schema.keys()):
                params[k] = v[ind]

            items.append(params)

        return map(lambda item: data_class(**item), items)

    def load_from_db_by_id(self, data_class, oid):
        return self.load_from_db_one(data_class, self.where(self._queries(id=oid)))

    def load_from_db_by_data(self, data_class, **kwargs):
        return self.load_from_db_multiple(data_class, self.where(self._and(self._queries(**kwargs))))

    def list_from_db(self, data_class, num=0, columns=None):
        return self.load_from_db_multiple(data_class, num=num, columns=columns)


class LocalFile (DBProvider):
    def __init__(self):
        self.DB_PATH = os.getenv("DB_PATH", os.path.join(common.BASE_PATH, "db-store"))
        super().__init__()

    def init_db(self):
        os.makedirs(self.DB_PATH, exist_ok=True)

    def register_object(self, data_object):
        os.makedirs(os.path.join(self.DB_PATH, data_object.table), exist_ok=True)

    @staticmethod
    def object2dict(in_object):
        return {k: getattr(in_object, k) for k in in_object.schema.keys()}

    def exists_in_db_with_id(self, data_class, oid):
        return self.load_from_db_by_id(data_class, oid) is not None

    def exist_in_db_with_ids(self, data_class, oids):
        fpath = os.path.join(self.DB_PATH, data_class.table)
        result = self.load_from_db_multiple(data_class, fpath, columns=["id"])
        if result is None:
            return False
        return len(result) == len(oids)

    def save_to_db(self, in_object):
        fpath = os.path.join(self.DB_PATH, in_object.table)
        with open(os.path.join(fpath, f"{in_object.id}.yaml"), 'w') as f:
            yaml.dump(self.object2dict(in_object), f)

    def delete_from_db_by_id(self, data_class, oid):
        file_path = os.path.join(self.DB_PATH, data_class.table, f"{oid}.yaml")

        if not os.path.isfile(file_path):
            return

        os.remove(file_path)

    def delete_from_db_by_ids(self, data_class, oids):
        for oid in oids:
            self.delete_from_db_by_id(data_class, oid)

    def load_from_db_by_id(self, data_class, oid):
        file_path = os.path.join(self.DB_PATH, data_class.table, f"{oid}.yaml")

        if not os.path.isfile(file_path):
            return None

        with open(file_path, 'r') as f:
            params = yaml.safe_load(f)

        return data_class(**params)

    def load_from_db_multiple(self, data_class, fpath, num=0, columns=None):
        if columns is None:
            return map(lambda o: data_class(**o), (map(lambda f: yaml.safe_load(f), os.listdir(fpath)) if num == 0 else islice(map(lambda f: yaml.safe_load(f), os.listdir(fpath)), num)))
        return [{k: val for k, val in o if k in columns} for o in (map(lambda f: yaml.safe_load(f), os.listdir(fpath)) if num == 0 else islice(map(lambda f: yaml.safe_load(f), os.listdir(fpath)), num))]

    def load_from_db_by_data(self, data_class, **kwargs):
        fpath = os.path.join(self.DB_PATH, data_class.table)
        result = self.load_from_db_multiple(data_class, fpath)
        if result is None:
            return None
        return filter(lambda in_object: all([getattr(in_object, k) == val for k, val in kwargs.items()]), result)

    def list_from_db(self, data_class, num=0, columns=None):
        fpath = os.path.join(self.DB_PATH, data_class.table)
        return self.load_from_db_multiple(data_class, fpath, num, columns=columns)
