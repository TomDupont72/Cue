import dagster as dg
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


class DatabaseResource(dg.ConfigurableResource):
    database_url: str

    def get_engine(self) -> Engine:
        return create_engine(
            self.database_url,
            pool_pre_ping=True,
        )