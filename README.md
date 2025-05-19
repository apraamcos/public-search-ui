# APRA AMCOS Public Work Search API Documentation

## Overview

The APRA AMCOS Public Work Search API provides a way for authorized client applications to search for musical works in the APRA AMCOS database. This document provides comprehensive information about the API's functionality, request parameters, response structure, and validation rules.

## Endpoint

```
Please refer to the dev.env or sit.env file
```

## Headers

Please refer to the `App.tsx` file for any headers required to make the API call

## Operation: searchWorkPublic

This GraphQL query allows searching for musical works using various search criteria.

### GraphQL Query Structure

```graphql
query SearchWorks($input: WorkSearchPublicInput!) {
  searchWorkPublic(workSearchInput: $input) {
    works {
      winfkey
      title
      iswc
      exclWriter
      isDispute
      isPdof
      isNc
      isCisnetExclude
      writers
      isLocal
      workMessage
      amcosControl
      akas
      publishersWithDetails {
        wrthkey
        name
        isApraMember
        isAmcosMember
      }
      performers
    }
    total
  }
}
```

### Input Parameters

The `WorkSearchPublicInput` object accepts the following parameters:

| Parameter  | Type    | Required | Description                                           | Validation Rules                                                                                   |
|------------|---------|----------|-------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| title      | String  | No*      | Keyword to match work titles and alternative titles    | Max length: 60 characters<br>Min length: 1 character<br>If length < 3, must use Exact match type   |
| writer     | String  | No*      | Writer name to search for                             | Max length: 40 characters<br>Min length: 2 characters                                              |
| performer  | String  | No*      | Performer name to search for                          | Max length: 45 characters<br>Min length: 2 characters                                              |
| skip       | Int     | No       | Number of results to skip (for pagination)            | Default: 0                                                                                         |
| take       | Int     | No       | Maximum number of results to return                   | Default: 10 (system defined)                                                                       |
| sort       | Object  | No       | Sorting options                                       | See Sort Options section                                                                           |

*At least one of these search parameters must be provided.

### Sort Options

The sort parameter accepts a `WorkSearchSort` object with the following properties:

| Parameter | Type       | Required | Description                 | Possible Values                                                            |
|-----------|------------|----------|-----------------------------|----------------------------------------------------------------------------|
| sortBy    | String     | Yes      | Field to sort by            | TITLE, WINF_WRITERS, LAST_PAID, LAST_PERFORMED                            |
| order     | SortOrder  | Yes      | Sort direction              | asc, desc                                                                 |

### Important Validation Rules

1. **Required Fields**: At least one of `title`, `writer`, or `performer` must be provided.

2. **Title Validation**:
   - If `title` is provided and less than 3 characters, it must use Exact match type
   - Maximum length: 60 characters
   - Minimum length: 1 character

3. **Writer Validation**:
   - Maximum length: 40 characters
   - Minimum length: 2 characters

4. **Performer Validation**:
   - Maximum length: 45 characters
   - Minimum length: 2 characters

### Response Structure

The response will be a `WorkSearchPublicResult` object with the following structure:

| Field      | Type                    | Description                                                  |
|------------|-------------------------|--------------------------------------------------------------|
| works      | [WorkSearchPublic]      | Array of work objects matching the search criteria           |
| total      | Int                     | Total number of works matching the search criteria           |

Each `WorkSearchPublic` object contains:

| Field                | Type                   | Description                                              |
|----------------------|------------------------|----------------------------------------------------------|
| winfkey              | String                 | APRA Work ID                                             |
| title                | String                 | Work title                                               |
| iswc                 | String                 | International Standard Work Code (if available)          |
| exclWriter           | String                 | Writer exclusion code                                    |
| isDispute            | Boolean                | Whether the work is in dispute                           |
| isPdof               | Boolean                | Whether the work has performing division of fees         |
| isNc                 | Boolean                | Whether the work is NC type                              |
| isCisnetExclude      | Boolean                | Whether the work is excluded from CISNet                 |
| writers              | [String]               | List of writer names (may be limited based on exclusions)|
| isLocal              | Boolean                | Whether the work has local writers or publishers         |
| workMessage          | String                 | Additional message about the work (if applicable)        |
| amcosControl         | String                 | AMCOS control percentage (if applicable)                 |
| akas                 | [String]               | Alternative titles for the work                          |
| publishersWithDetails| [PublisherWithDetails] | Detailed information about publishers (if no dispute)    |
| performers           | [String]               | List of performers associated with the work              |

`PublisherWithDetails` contains:

| Field         | Type     | Description                                            |
|---------------|----------|--------------------------------------------------------|
| wrthkey       | String   | Publisher unique identifier                            |
| name          | String   | Publisher name                                         |
| isApraMember  | Boolean  | Whether the publisher is an APRA member                |
| isAmcosMember | Boolean  | Whether the publisher is an AMCOS member               |

### Examples

#### Example 1: Search by title

```graphql
query {
  searchWorkPublic(workSearchInput: {
    title: "Yesterday"
  }) {
    works {
      winfkey
      title
      writers
      performers
    }
    total
  }
}
```

#### Example 2: Search by writer with pagination and sorting

```graphql
query {
  searchWorkPublic(workSearchInput: {
    writer: "Lennon",
    skip: 0,
    take: 10,
    sort: {
      sortBy: "TITLE",
      order: "asc"
    }
  }) {
    works {
      winfkey
      title
      writers
      performers
    }
    total
  }
}
```

#### Example 3: Search by performer

```graphql
query {
  searchWorkPublic(workSearchInput: {
    performer: "Beatles"
  }) {
    works {
      winfkey
      title
      writers
      performers
    }
    total
  }
}
```

### Error Handling

The API may return the following errors:

| Error Code                        | Description                                                  |
|-----------------------------------|--------------------------------------------------------------|
| MUST_HAVE_ONE_CORE_SEARCH_KEY     | At least one of title, writer, or performer must be provided |
| INVALID_SEARCH_KEYWORD            | Title search term is invalid (length restrictions)           |
| INVALID_SEARCH_INPUT_TYPE         | Title search term needs a specified input type               |
| SHORT_KEYWORD_NEEDS_TO_BE_EXACT   | Title search term with less than 3 chars must be exact match |
| INVALID_WRITER_KEYWORD            | Writer search term is invalid (length restrictions)          |
| INVALID_PERFORMER_KEYWORD         | Performer search term is invalid (length restrictions)       |

### Notes for Implementation

1. The API enforces various validation rules to ensure data quality and performance. Make sure your application respects these constraints.

2. For pagination, use the `skip` and `take` parameters. The default page size is 10 items.

3. The contents of writer information may be limited due to privacy and copyright considerations, depending on the work's status.

4. Performance considerations:
   - Try to use specific search terms to reduce result sets
   - For large result sets, implement proper pagination

5. Certain information about works may be restricted based on dispute status or other criteria.

## Support

For additional assistance or information regarding this API, please contact the APRA AMCOS API support team.




## How to run it locally

copy the `config/dev.env` or `config/sit.env` into the root dir of this project and call rename to .env

npm i

npm start


