FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH" \
    DAGSTER_HOME="/opt/dagster/dagster_home" \
    DAGSTER_STORAGE_DIR="/opt/dagster/dagster_home/state/storage" \
    DAGSTER_COMPUTE_LOGS_DIR="/opt/dagster/dagster_home/state/compute_logs"

ARG UV_VERSION=0.12.0

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /opt/dagster/dagster_home

RUN pip install --no-cache-dir "uv==${UV_VERSION}"

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY src ./src
RUN uv sync --frozen --no-dev --no-editable

COPY dagster.yaml /opt/dagster/dagster_home/dagster.yaml

CMD ["dagster-webserver", "-h", "0.0.0.0", "-p", "3000", "-m", "orchestrator.definitions"]
