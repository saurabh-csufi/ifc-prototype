# Data Commons REST API v2 - Reference Guide

> **Local Instance Base URL**: `http://localhost:8080/core/api/v2/`
> **Public API Base URL**: `https://api.datacommons.org/v2/`

## Overview

The Data Commons REST API v2 consolidates the 24 endpoints from V1 into **3 endpoints**:

| Endpoint | Path | Purpose |
|----------|------|---------|
| **Node** | `/v2/node` | Fetch graph edges, properties, and neighboring nodes |
| **Observation** | `/v2/observation` | Fetch statistical observations (time series data) |
| **Resolve** | `/v2/resolve` | Resolve names/IDs/coordinates to Data Commons DCIDs |

All endpoints support both **GET** and **POST** methods. Responses are JSON.

---

## Authentication

| Instance Type | Auth Required | Method |
|---------------|---------------|--------|
| **Public API** | Yes - API Key | GET: `?key=API_KEY` / POST: Header `X-API-Key: API_KEY` |
| **Custom/Local** (localhost:8080) | **No** | No key needed |

**Public API Keys:**
- Trial key (limited quota): `AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI`
- Production key: Request at `https://apikeys.datacommons.org`

---

## Key Concepts

### DCID (Data Commons Identifier)
Every node in the knowledge graph has a unique DCID.
- Places: `geoId/06` (California), `country/USA`, `country/IND` (India)
- Variables: `Count_Person`, `Median_Income_Person`
- Custom variables: `AISHE_Colleges_Count`, etc.

### Relation Expression Syntax

Used in `property` parameters for graph traversal:

| Operator | Meaning | Example |
|----------|---------|---------|
| `->` | Outgoing edge | `->name` (get name property) |
| `<-` | Incoming edge | `<-containedInPlace` (get entities contained in this place) |
| `+` | Transitive closure | `<-containedInPlace+` (all descendants). Only for `containedInPlace` |
| `*` | Wildcard (all properties) | `->*` (all outgoing properties) |
| `[]` | Multiple properties | `->[name, latitude, longitude]` |
| `{}` | Type filter | `{typeOf:State}` (restrict to State type) |

**Combining:** `<-containedInPlace+{typeOf:County}` = "all counties transitively contained in this place"

### Pagination

When results exceed a page, the response includes a `nextToken` string:
- GET: `&nextToken=TOKEN_STRING` (URL-encode special chars)
- POST: `"nextToken": "TOKEN_STRING"` in JSON body

### URL Encoding (GET requests)

| Character | Encoded |
|-----------|---------|
| `/` | `%2F` |
| `<` | `%3C` |
| `>` | `%3E` |
| `*` | `%2A` |
| `{` | `%7B` |
| `}` | `%7D` |

Do NOT encode `&`, `=`, or `-`.

---

## Endpoint 1: Node (`/v2/node`)

Fetch information about edges (arcs) and neighboring nodes in the knowledge graph.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodes` | list of strings | Yes | DCIDs of nodes to query |
| `property` | string | Yes | Relation expression defining what to retrieve |
| `nextToken` | string | No | Pagination token |

### Request Formats

**GET:**
```
GET http://localhost:8080/core/api/v2/node?nodes=DCID&property=EXPRESSION
```

**POST:**
```bash
curl -X POST http://localhost:8080/core/api/v2/node \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": ["DCID1", "DCID2"],
    "property": "EXPRESSION"
  }'
```

### Response Structure

When querying for **property labels** (`property: "<-"` or `property: "->"`):
```json
{
  "data": {
    "NODE_DCID": {
      "properties": ["label1", "label2", "label3"]
    }
  }
}
```

When querying for **values** (e.g., `property: "->name"`):
```json
{
  "data": {
    "NODE_DCID": {
      "arcs": {
        "PROPERTY_LABEL": {
          "nodes": [
            {
              "dcid": "string",
              "name": "string",
              "provenanceId": "string",
              "value": "string",
              "types": ["string"]
            }
          ]
        }
      }
    }
  },
  "nextToken": "TOKEN_STRING"
}
```

### Examples

#### 1. Get all incoming property labels for India
```bash
curl "http://localhost:8080/core/api/v2/node?nodes=country/IND&property=%3C-"
```

#### 2. Get the name of a node
```bash
curl "http://localhost:8080/core/api/v2/node?nodes=country/IND&property=-%3Ename"
```

#### 3. Get all states in India (with type filter)
```bash
curl "http://localhost:8080/core/api/v2/node?nodes=country/IND&property=%3C-containedInPlace%2B%7BtypeOf:State%7D"
```
Expression: `<-containedInPlace+{typeOf:State}`

#### 4. Multiple properties for multiple nodes (POST)
```bash
curl -X POST http://localhost:8080/core/api/v2/node \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": ["geoId/06085", "geoId/06087"],
    "property": "->[name, latitude, longitude]"
  }'
```

#### 5. Get all outgoing properties (wildcard)
```bash
curl "http://localhost:8080/core/api/v2/node?nodes=Count_Person&property=-%3E%2A"
```
Expression: `->*`

#### 6. List all statistical variables
```bash
curl "http://localhost:8080/core/api/v2/node?nodes=StatisticalVariable&property=%3C-typeOf"
```
Expression: `<-typeOf`

#### 7. List all entity types
```bash
curl "http://localhost:8080/core/api/v2/node?nodes=Class&property=%3C-typeOf"
```

---

## Endpoint 2: Observation (`/v2/observation`)

Fetch statistical observation data (time-series values for variables measured at entities over time).

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `variable.dcids` | list of strings | Conditional | Statistical variable DCIDs. Omit to discover available variables. |
| `entity.dcids` | list of strings | One required | Entity DCIDs to query |
| `entity.expression` | string | One required | Relation expression for entities (alternative to `entity.dcids`) |
| `date` | string | Yes | `"LATEST"`, ISO-8601 date (`"2020"`, `"2020-06"`), or `""` (all dates) |
| `select` | list of strings | Yes | Must include `"variable"` and `"entity"`. Optionally add `"date"`, `"value"`, `"facet"`. |
| `filter.facet_ids` | list of strings | No | Filter to specific facet IDs |
| `filter.domains` | list of strings | No | Filter to specific provenance domains |
| `nextToken` | string | No | Pagination token |

### Select Parameter Rules
- `variable` and `entity` are **always required**
- Omitting `date` and `value` returns metadata only (data availability check)
- Including `facet` adds source/methodology metadata

### Date Format
| Value | Meaning |
|-------|---------|
| `"LATEST"` | Most recent observation per entity per facet |
| `"2020"` | Yearly granularity |
| `"2020-06"` | Monthly granularity |
| `"2020-06-15"` | Daily granularity |
| `""` (empty) | All available dates |

### Request Formats

**GET:**
```
GET http://localhost:8080/core/api/v2/observation?date=LATEST&variable.dcids=Count_Person&entity.dcids=country/IND&select=date&select=entity&select=variable&select=value
```

**POST:**
```bash
curl -X POST http://localhost:8080/core/api/v2/observation \
  -H "Content-Type: application/json" \
  -d '{
    "date": "LATEST",
    "variable": {
      "dcids": ["Count_Person"]
    },
    "entity": {
      "dcids": ["country/IND"]
    },
    "select": ["date", "entity", "variable", "value"]
  }'
```

### Response Structure

```json
{
  "byVariable": {
    "VARIABLE_DCID": {
      "byEntity": {
        "ENTITY_DCID": {
          "orderedFacets": [
            {
              "facetId": "FACET_ID",
              "earliestDate": "2000",
              "latestDate": "2023",
              "obsCount": 24,
              "observations": [
                {
                  "date": "2023",
                  "value": 1400000000
                }
              ]
            }
          ]
        }
      }
    }
  },
  "facets": {
    "FACET_ID": {
      "importName": "DatasetName",
      "provenanceUrl": "https://source.url/",
      "measurementMethod": "SurveyMethodName",
      "observationPeriod": "P1Y",
      "unit": "USD",
      "scalingFactor": "1",
      "isDcAggregate": false
    }
  }
}
```

**Facet metadata fields:**
- `importName`: Dataset name
- `provenanceUrl`: Source URL
- `measurementMethod`: How the data was collected
- `observationPeriod`: ISO 8601 duration (`P1Y` = yearly, `P1M` = monthly)
- `unit`: Unit of measurement
- `isDcAggregate`: Whether DC aggregated this from sub-entities

### Examples

#### 1. Discover available variables for an entity
```bash
curl "http://localhost:8080/core/api/v2/observation?entity.dcids=country/IND&select=variable&select=entity"
```
No `variable.dcids`, no `date`/`value` -- returns list of available variables.

#### 2. Latest population for India
```bash
curl "http://localhost:8080/core/api/v2/observation?date=LATEST&variable.dcids=Count_Person&entity.dcids=country%2FIND&select=date&select=entity&select=variable&select=value"
```

#### 3. All historical observations
```bash
curl -X POST http://localhost:8080/core/api/v2/observation \
  -H "Content-Type: application/json" \
  -d '{
    "date": "",
    "variable": {"dcids": ["Count_Person"]},
    "entity": {"dcids": ["country/IND"]},
    "select": ["date", "entity", "variable", "value"]
  }'
```

#### 4. Observations for a specific year
```bash
curl "http://localhost:8080/core/api/v2/observation?date=2020&variable.dcids=Count_Person&entity.dcids=country%2FIND&select=date&select=entity&select=variable&select=value"
```

#### 5. Expression-based entities (all states in India)
```bash
curl -X POST http://localhost:8080/core/api/v2/observation \
  -H "Content-Type: application/json" \
  -d '{
    "date": "LATEST",
    "variable": {"dcids": ["Count_Person"]},
    "entity": {"expression": "country/IND<-containedInPlace+{typeOf:State}"},
    "select": ["date", "entity", "variable", "value"]
  }'
```

#### 6. With facet metadata
```bash
curl -X POST http://localhost:8080/core/api/v2/observation \
  -H "Content-Type: application/json" \
  -d '{
    "date": "LATEST",
    "variable": {"dcids": ["Count_Person"]},
    "entity": {"dcids": ["country/IND"]},
    "select": ["date", "entity", "variable", "value", "facet"]
  }'
```

#### 7. Custom AISHE variables (example for local instance)
```bash
curl "http://localhost:8080/core/api/v2/observation?date=LATEST&variable.dcids=AISHE_Colleges_Count&entity.dcids=country%2FIND&select=date&select=entity&select=variable&select=value"
```

---

## Endpoint 3: Resolve (`/v2/resolve`)

Resolve entity names, coordinates, or external identifiers to Data Commons DCIDs. Also resolves natural language descriptions to statistical variable DCIDs.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodes` | list of strings | Yes | Terms to resolve (names, IDs, coordinates) |
| `property` | string | No | Expression describing identifier type, must end with `->dcid` |
| `resolver` | string | No | `"place"` (default) or `"indicator"` (for statistical variables) |
| `target` | string | No | Custom instances only: `"custom_only"`, `"base_only"`, or `"base_and_custom"` (default) |

### Supported Property Expressions

| Property | Input Format | Description |
|----------|-------------|-------------|
| `<-description->dcid` | Name/description | Default, resolves text names |
| `<-description{typeOf:State}->dcid` | Name + type filter | Disambiguate by type |
| `<-geoCoordinate->dcid` | `lat#long` | Resolve coordinates |
| `<-wikidataId->dcid` | Wikidata ID | e.g., `Q668` for India |
| `<-isoCode->dcid` | ISO code | e.g., `IN-MH` for Maharashtra |
| `<-nutsCode->dcid` | EU NUTS code | |
| `<-unDataCode->dcid` | UN data code | |

### Response Structure

**Place resolution:**
```json
{
  "entities": [
    {
      "node": "India",
      "candidates": [
        {"dcid": "country/IND", "dominantType": "Country"}
      ]
    }
  ]
}
```

**Indicator resolution:**
```json
{
  "entities": [
    {
      "node": "population",
      "candidates": [
        {
          "dcid": "Count_Person",
          "metadata": {"score": 0.8982, "sentence": "Total Population"},
          "typeOf": ["StatisticalVariable"]
        }
      ]
    }
  ]
}
```

### Examples

#### 1. Resolve a place name
```bash
curl "http://localhost:8080/core/api/v2/resolve?nodes=Maharashtra&property=%3C-description-%3Edcid"
```

#### 2. Resolve with type filter
```bash
curl "http://localhost:8080/core/api/v2/resolve?nodes=Maharashtra&property=%3C-description%7BtypeOf:State%7D-%3Edcid"
```
Expression: `<-description{typeOf:State}->dcid`

#### 3. Resolve coordinates
```bash
curl "http://localhost:8080/core/api/v2/resolve?nodes=19.07%2328.96&property=%3C-geoCoordinate-%3Edcid"
```
Format: `lat#long`

#### 4. Resolve a Wikidata ID
```bash
curl "http://localhost:8080/core/api/v2/resolve?nodes=Q668&property=%3C-wikidataId-%3Edcid"
```

#### 5. Resolve a statistical variable by description
```bash
curl -X POST http://localhost:8080/core/api/v2/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": ["number of colleges", "teacher count"],
    "resolver": "indicator"
  }'
```

#### 6. Resolve multiple places (POST)
```bash
curl -X POST http://localhost:8080/core/api/v2/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": ["Delhi", "Mumbai", "Bengaluru"],
    "property": "<-description{typeOf:City}->dcid"
  }'
```

#### 7. Custom instance - resolve from custom data only
```bash
curl -X POST http://localhost:8080/core/api/v2/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": ["Maharashtra"],
    "property": "<-description->dcid",
    "target": "custom_only"
  }'
```

#### 8. Custom instance - resolve from base DC only
```bash
curl -X POST http://localhost:8080/core/api/v2/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": ["India"],
    "property": "<-description->dcid",
    "target": "base_only"
  }'
```

---

## Custom Instance Notes (localhost:8080)

| Aspect | Public DC | Local/Custom DC |
|--------|-----------|-----------------|
| Base URL | `https://api.datacommons.org/v2/` | `http://localhost:8080/core/api/v2/` |
| API Key | Required | **Not required** |
| Data | Public datasets only | Custom data + public (hybrid) |
| Resolve `target` | Not applicable | `custom_only`, `base_only`, `base_and_custom` |

### Important Path Difference
Custom instances use `/core/api/v2/` NOT `/v2/`:
```
http://localhost:8080/core/api/v2/node
http://localhost:8080/core/api/v2/observation
http://localhost:8080/core/api/v2/resolve
```

### Hybrid Resolution
When a custom instance cannot fully resolve a query from local data, it automatically makes an anonymous call to the base Data Commons API to supplement results.

---

## Troubleshooting

| Error | Code | Cause | Fix |
|-------|------|-------|-----|
| "Method doesn't allow unregistered callers" | 16 | Missing API key (public API only) | Add `key=` param or `X-API-Key` header |
| Empty response `{}` | -- | Wrong parameter values | Verify DCID spelling, check URL encoding |
| "grpc: error while marshaling" | 13 | Missing/misspelled parameters | Check all required params are present |
| Connection refused | -- | Local instance not running | Start docker: `./run_cdc_dev_docker.sh` |

---

## Quick Reference: Common Queries for AISHE/Education Data

### List all custom statistical variables
```bash
curl "http://localhost:8080/core/api/v2/node?nodes=StatisticalVariable&property=%3C-typeOf"
```

### Get all observations for a custom variable across states
```bash
curl -X POST http://localhost:8080/core/api/v2/observation \
  -H "Content-Type: application/json" \
  -d '{
    "date": "",
    "variable": {"dcids": ["AISHE_Colleges_Count"]},
    "entity": {"expression": "country/IND<-containedInPlace+{typeOf:State}"},
    "select": ["date", "entity", "variable", "value"]
  }'
```

### Resolve a state name to its DCID
```bash
curl "http://localhost:8080/core/api/v2/resolve?nodes=Tamil%20Nadu&property=%3C-description%7BtypeOf:State%7D-%3Edcid"
```

### Get all properties of a statistical variable
```bash
curl "http://localhost:8080/core/api/v2/node?nodes=AISHE_Colleges_Count&property=-%3E%2A"
```

---

## Glossary

| Term | Definition |
|------|------------|
| **DCID** | Unique identifier for every node (e.g., `geoId/06`, `Count_Person`) |
| **Entity** | A real-world thing (place, school, etc.) represented as a graph node |
| **Statistical Variable** | A measurable metric (e.g., `Count_Person`, `AISHE_Colleges_Count`) |
| **Observation** | A single measured value for a variable at a specific entity and time |
| **Facet** | A combination of source, methodology, and measurement details |
| **Provenance** | The specific data import/table within a dataset |
| **Triple** | A subject-predicate-object relationship in the knowledge graph |
| **Arc/Edge** | A labeled connection between two nodes (a property) |

---

## V1 to V2 Migration

| V1 Endpoint | V2 Equivalent |
|-------------|---------------|
| `find/entities` | `resolve` |
| `info/place`, `triples`, `properties`, `property/values` | `node` |
| `observations/series`, `observations/point` | `observation` |
| `query` (SPARQL) | No V2 equivalent (deprecated) |
| `event/collection` | No V2 equivalent (deprecated) |
