#variables we can use

- dataset_id: fd268f12-4952-4dac-8d2a-f8cdf3b0d6f0
- api_key: dataset-yjpBGgEpw3sdVP0bSWKU4d96

# Knowledge API

Authentication
Service API of Inova authenticates using an API-Key.

It is **strongly** suggested that developers store the API-Key in the backend instead of sharing or storing it in the client side to avoid the leakage of the API-Key, which may lead to property loss.

All API requests should include your API-Key in the Authorization HTTP Header, as shown below:

Code
  Authorization: Bearer {API_KEY}


Copy
Copied!
POST
/datasets/{dataset_id}/document/create_by_text
Create a document from text
This api is based on an existing Knowledge and creates a new document through text based on this Knowledge.

Params
Name
dataset_id
Type
string
Description
Knowledge ID

Request Body
Name
name      
Type
string
Description
Document name

Name
text
Type
string
Description
Document content

Name
indexing_technique
Type
string
Description
Index mode

high_quality High quality: embedding using embedding model, built as vector database index
economy Economy: Build using inverted index of Keyword Table Index
Name
process_rule
Type
object
Description
Processing rules

mode (string) Cleaning, segmentation mode, automatic / custom
rules (object) Custom rules (in automatic mode, this field is empty)
pre_processing_rules (array[object]) Preprocessing rules
id (string) Unique identifier for the preprocessing rule
enumerate
remove_extra_spaces Replace consecutive spaces, newlines, tabs
remove_urls_emails Delete URL, email address
enabled (bool) Whether to select this rule or not. If no document ID is passed in, it represents the default value.
segmentation (object) segmentation rules
separator Custom segment identifier, currently only allows one delimiter to be set. Default is \n
max_tokens Maximum length (token) defaults to 1000
Request
POST
/datasets/{dataset_id}/document/create_by_text
curl --location --request POST 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/document/create_by_text' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json' \
--data-raw '{"name": "text","text": "text","indexing_technique": "high_quality","process_rule": {"mode": "automatic"}}'

Copy
Copied!
Response
{
  "document": {
    "id": "",
    "position": 1,
    "data_source_type": "upload_file",
    "data_source_info": {
        "upload_file_id": ""
    },
    "dataset_process_rule_id": "",
    "name": "text.txt",
    "created_from": "api",
    "created_by": "",
    "created_at": 1695690280,
    "tokens": 0,
    "indexing_status": "waiting",
    "error": null,
    "enabled": true,
    "disabled_at": null,
    "disabled_by": null,
    "archived": false,
    "display_status": "queuing",
    "word_count": 0,
    "hit_count": 0,
    "doc_form": "text_model"
  },
  "batch": ""
}

Copy
Copied!
POST
/datasets/{dataset_id}/document/create_by_file
Create documents from files
This api is based on an existing Knowledge and creates a new document through a file based on this Knowledge.

Params
Name
dataset_id
Type
string
Description
Knowledge ID

Request Body
Name
data
Type
multipart/form-data json string
Description
original_document_id Source document ID (optional)

Used to re-upload the document or modify the document cleaning and segmentation configuration. The missing information is copied from the source document
The source document cannot be an archived document
When original_document_id is passed in, the update operation is performed on behalf of the document. process_rule is a fillable item. If not filled in, the segmentation method of the source document will be used by default
When original_document_id is not passed in, the new operation is performed on behalf of the document, and process_rule is required
indexing_technique Index mode

high_quality High quality: embedding using embedding model, built as vector database index
economy Economy: Build using inverted index of Keyword Table Index
process_rule Processing rules

mode (string) Cleaning, segmentation mode, automatic / custom
rules (object) Custom rules (in automatic mode, this field is empty)
pre_processing_rules (array[object]) Preprocessing rules
id (string) Unique identifier for the preprocessing rule
enumerate
remove_extra_spaces Replace consecutive spaces, newlines, tabs
remove_urls_emails Delete URL, email address
enabled (bool) Whether to select this rule or not. If no document ID is passed in, it represents the default value.
segmentation (object) segmentation rules
separator Custom segment identifier, currently only allows one delimiter to be set. Default is \n
max_tokens Maximum length (token) defaults to 1000
Name
file
Type
multipart/form-data
Description
Files that need to be uploaded.

Request
POST
/datasets/{dataset_id}/document/create_by_file
curl --location --request POST 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/document/create_by_file' \
--header 'Authorization: Bearer {api_key}' \
--form 'data="{"indexing_technique":"high_quality","process_rule":{"rules":{"pre_processing_rules":[{"id":"remove_extra_spaces","enabled":true},{"id":"remove_urls_emails","enabled":true}],"segmentation":{"separator":"###","max_tokens":500}},"mode":"custom"}}";type=text/plain' \
--form 'file=@"/path/to/file"'

Copy
Copied!
Response
{
  "document": {
    "id": "",
    "position": 1,
    "data_source_type": "upload_file",
    "data_source_info": {
      "upload_file_id": ""
    },
    "dataset_process_rule_id": "",
    "name": "Inova.txt",
    "created_from": "api",
    "created_by": "",
    "created_at": 1695308667,
    "tokens": 0,
    "indexing_status": "waiting",
    "error": null,
    "enabled": true,
    "disabled_at": null,
    "disabled_by": null,
    "archived": false,
    "display_status": "queuing",
    "word_count": 0,
    "hit_count": 0,
    "doc_form": "text_model"
  },
  "batch": ""
}

Copy
Copied!
POST
/datasets
Create an empty Knowledge
Request Body
Name
name
Type
string
Description
Knowledge name

Name
permission
Type
string
Description
Permission

only_me Only me
all_team_members All team members
partial_members Partial members
Request
POST
/datasets
curl --location --request POST 'http://127.0.0.1:5001/v1/datasets' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json' \
--data-raw '{"name": "name", "permission": "only_me"}'

Copy
Copied!
Response
{
  "id": "",
  "name": "name",
  "description": null,
  "provider": "vendor",
  "permission": "only_me",
  "data_source_type": null,
  "indexing_technique": null,
  "app_count": 0,
  "document_count": 0,
  "word_count": 0,
  "created_by": "",
  "created_at": 1695636173,
  "updated_by": "",
  "updated_at": 1695636173,
  "embedding_model": null,
  "embedding_model_provider": null,
  "embedding_available": null
}

Copy
Copied!
GET
/datasets
Knowledge list
Query
Name
page
Type
string
Description
Page number

Name
limit
Type
string
Description
Number of items returned, default 20, range 1-100

Request
POST
/datasets
curl --location --request GET 'http://127.0.0.1:5001/v1/datasets?page=1&limit=20' \
--header 'Authorization: Bearer {api_key}'

Copy
Copied!
Response
{
  "data": [
    {
      "id": "",
      "name": "name",
      "description": "desc",
      "permission": "only_me",
      "data_source_type": "upload_file",
      "indexing_technique": "",
      "app_count": 2,
      "document_count": 10,
      "word_count": 1200,
      "created_by": "",
      "created_at": "",
      "updated_by": "",
      "updated_at": ""
    },
    ...
  ],
  "has_more": true,
  "limit": 20,
  "total": 50,
  "page": 1
}

Copy
Copied!
DELETE
/datasets/{dataset_id}
Delete knowledge
Params
Name
dataset_id
Type
string
Description
Knowledge ID

Request
DELETE
/datasets/{dataset_id}
curl --location --request DELETE 'http://127.0.0.1:5001/v1/datasets/{dataset_id}' \
--header 'Authorization: Bearer {api_key}'

Copy
Copied!
Response
204 No Content

Copy
Copied!
POST
/datasets/{dataset_id}/documents/{document_id}/update_by_text
Update document via text
This api is based on an existing Knowledge and updates the document through text based on this Knowledge.

Params
Name
dataset_id
Type
string
Description
Knowledge ID

Name
document_id
Type
string
Description
Document ID

Request Body
Name
name
Type
string
Description
Document name (optional)

Name
text
Type
string
Description
Document content (optional)

Name
process_rule
Type
object
Description
Processing rules

mode (string) Cleaning, segmentation mode, automatic / custom
rules (object) Custom rules (in automatic mode, this field is empty)
pre_processing_rules (array[object]) Preprocessing rules
id (string) Unique identifier for the preprocessing rule
enumerate
remove_extra_spaces Replace consecutive spaces, newlines, tabs
remove_urls_emails Delete URL, email address
enabled (bool) Whether to select this rule or not. If no document ID is passed in, it represents the default value.
segmentation (object) segmentation rules
separator Custom segment identifier, currently only allows one delimiter to be set. Default is \n
max_tokens Maximum length (token) defaults to 1000
Request
POST
/datasets/{dataset_id}/documents/{document_id}/update_by_text
curl --location --request POST 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/documents/{document_id}/update_by_text' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json' \
--data-raw '{"name": "name","text": "text"}'

Copy
Copied!
Response
{
  "document": {
    "id": "",
    "position": 1,
    "data_source_type": "upload_file",
    "data_source_info": {
      "upload_file_id": ""
    },
    "dataset_process_rule_id": "",
    "name": "name.txt",
    "created_from": "api",
    "created_by": "",
    "created_at": 1695308667,
    "tokens": 0,
    "indexing_status": "waiting",
    "error": null,
    "enabled": true,
    "disabled_at": null,
    "disabled_by": null,
    "archived": false,
    "display_status": "queuing",
    "word_count": 0,
    "hit_count": 0,
    "doc_form": "text_model"
  },
  "batch": ""
}

Copy
Copied!
POST
/datasets/{dataset_id}/documents/{document_id}/update_by_file
Update a document from a file
This api is based on an existing Knowledge, and updates documents through files based on this Knowledge

Params
Name
dataset_id
Type
string
Description
Knowledge ID

Name
document_id
Type
string
Description
Document ID

Request Body
Name
name
Type
string
Description
Document name (optional)

Name
file
Type
multipart/form-data
Description
Files to be uploaded

Name
process_rule
Type
object
Description
Processing rules

mode (string) Cleaning, segmentation mode, automatic / custom
rules (object) Custom rules (in automatic mode, this field is empty)
pre_processing_rules (array[object]) Preprocessing rules
id (string) Unique identifier for the preprocessing rule
enumerate
remove_extra_spaces Replace consecutive spaces, newlines, tabs
remove_urls_emails Delete URL, email address
enabled (bool) Whether to select this rule or not. If no document ID is passed in, it represents the default value.
segmentation (object) segmentation rules
separator Custom segment identifier, currently only allows one delimiter to be set. Default is \n
max_tokens Maximum length (token) defaults to 1000
Request
POST
/datasets/{dataset_id}/documents/{document_id}/update_by_file
curl --location --request POST 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/documents/{document_id}/update_by_file' \
--header 'Authorization: Bearer {api_key}' \
--form 'data="{"name":"Inova","indexing_technique":"high_quality","process_rule":{"rules":{"pre_processing_rules":[{"id":"remove_extra_spaces","enabled":true},{"id":"remove_urls_emails","enabled":true}],"segmentation":{"separator":"###","max_tokens":500}},"mode":"custom"}}";type=text/plain' \
--form 'file=@"/path/to/file"'

Copy
Copied!
Response
{
  "document": {
    "id": "",
    "position": 1,
    "data_source_type": "upload_file",
    "data_source_info": {
      "upload_file_id": ""
    },
    "dataset_process_rule_id": "",
    "name": "Inova.txt",
    "created_from": "api",
    "created_by": "",
    "created_at": 1695308667,
    "tokens": 0,
    "indexing_status": "waiting",
    "error": null,
    "enabled": true,
    "disabled_at": null,
    "disabled_by": null,
    "archived": false,
    "display_status": "queuing",
    "word_count": 0,
    "hit_count": 0,
    "doc_form": "text_model"
  },
  "batch": "20230921150427533684"
}

Copy
Copied!
GET
/datasets/{dataset_id}/documents/{batch}/indexing-status
Get document embedding status (progress)
Params
Name
dataset_id
Type
string
Description
Knowledge ID

Name
batch
Type
string
Description
Batch number of uploaded documents

Request
GET
/datasets/{dataset_id}/documents/{batch}/indexing-status
curl --location --request GET 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/documents/{batch}/indexing-status' \
--header 'Authorization: Bearer {api_key}'

Copy
Copied!
Response
{
  "data":[{
    "id": "",
    "indexing_status": "indexing",
    "processing_started_at": 1681623462.0,
    "parsing_completed_at": 1681623462.0,
    "cleaning_completed_at": 1681623462.0,
    "splitting_completed_at": 1681623462.0,
    "completed_at": null,
    "paused_at": null,
    "error": null,
    "stopped_at": null,
    "completed_segments": 24,
    "total_segments": 100
  }]
}

Copy
Copied!
DELETE
/datasets/{dataset_id}/documents/{document_id}
Delete document
Params
Name
dataset_id
Type
string
Description
Knowledge ID

Name
document_id
Type
string
Description
Document ID

Request
DELETE
/datasets/{dataset_id}/documents/{document_id}
curl --location --request DELETE 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/documents/{document_id}' \
--header 'Authorization: Bearer {api_key}'

Copy
Copied!
Response
{
  "result": "success"
}

Copy
Copied!
GET
/datasets/{dataset_id}/documents
Knowledge document list
Params
Name
dataset_id
Type
string
Description
Knowledge ID

Query
Name
keyword
Type
string
Description
Search keywords, currently only search document names(optional)

Name
page
Type
string
Description
Page number(optional)

Name
limit
Type
string
Description
Number of items returned, default 20, range 1-100(optional)

Request
GET
/datasets/{dataset_id}/documents
curl --location --request GET 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/documents' \
--header 'Authorization: Bearer {api_key}'

Copy
Copied!
Response
{
  "data": [
    {
      "id": "",
      "position": 1,
      "data_source_type": "file_upload",
      "data_source_info": null,
      "dataset_process_rule_id": null,
      "name": "dify",
      "created_from": "",
      "created_by": "",
      "created_at": 1681623639,
      "tokens": 0,
      "indexing_status": "waiting",
      "error": null,
      "enabled": true,
      "disabled_at": null,
      "disabled_by": null,
      "archived": false
    },
  ],
  "has_more": false,
  "limit": 20,
  "total": 9,
  "page": 1
}

Copy
Copied!
POST
/datasets/{dataset_id}/documents/{document_id}/segments
Add segment
Params
Name
dataset_id
Type
string
Description
Knowledge ID

Name
document_id
Type
string
Description
Document ID

Request Body
Name
segments
Type
object list
Description
content (text) Text content/question content, required
answer (text) Answer content, if the mode of the Knowledge is qa mode, pass the value(optional)
keywords (list) Keywords(optional)
Request
POST
/datasets/{dataset_id}/documents/{document_id}/segments
curl --location --request POST 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/documents/{document_id}/segments' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json' \
--data-raw '{"segments": [{"content": "1","answer": "1","keywords": ["a"]}]}'

Copy
Copied!
Response
{
  "data": [{
    "id": "",
    "position": 1,
    "document_id": "",
    "content": "1",
    "answer": "1",
    "word_count": 25,
    "tokens": 0,
    "keywords": [
      "a"
    ],
    "index_node_id": "",
    "index_node_hash": "",
    "hit_count": 0,
    "enabled": true,
    "disabled_at": null,
    "disabled_by": null,
    "status": "completed",
    "created_by": "",
    "created_at": 1695312007,
    "indexing_at": 1695312007,
    "completed_at": 1695312007,
    "error": null,
    "stopped_at": null
  }],
  "doc_form": "text_model"
}

Copy
Copied!
GET
/datasets/{dataset_id}/documents/{document_id}/segments
get documents segments
Path
Name
dataset_id
Type
string
Description
Knowledge ID

Name
document_id
Type
string
Description
Document ID

Query
Name
keyword
Type
string
Description
keyword，choosable

Name
status
Type
string
Description
Search status，completed

Request
GET
/datasets/{dataset_id}/documents/{document_id}/segments
curl --location --request GET 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/documents/{document_id}/segments' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json'

Copy
Copied!
Response
{
  "data": [{
    "id": "",
    "position": 1,
    "document_id": "",
    "content": "1",
    "answer": "1",
    "word_count": 25,
    "tokens": 0,
    "keywords": [
        "a"
    ],
    "index_node_id": "",
    "index_node_hash": "",
    "hit_count": 0,
    "enabled": true,
    "disabled_at": null,
    "disabled_by": null,
    "status": "completed",
    "created_by": "",
    "created_at": 1695312007,
    "indexing_at": 1695312007,
    "completed_at": 1695312007,
    "error": null,
    "stopped_at": null
  }],
  "doc_form": "text_model"
}

Copy
Copied!
DELETE
/datasets/{dataset_id}/documents/{document_id}/segments/{segment_id}
delete document segment
Path
Name
dataset_id
Type
string
Description
Knowledge ID

Name
document_id
Type
string
Description
Document ID

Name
segment_id
Type
string
Description
Document Segment ID

Request
DELETE
/datasets/{dataset_id}/documents/{document_id}/segments/{segment_id}
curl --location --request DELETE 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/segments/{segment_id}' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json'

Copy
Copied!
Response
{
  "result": "success"
}

Copy
Copied!
POST
/datasets/{dataset_id}/documents/{document_id}/segments/{segment_id}
update document segment
POST
Name
dataset_id
Type
string
Description
Knowledge ID

Name
document_id
Type
string
Description
Document ID

Name
segment_id
Type
string
Description
Document Segment ID

Request Body
Name
segment
Type
object
Description
content (text) text content/question content，required
answer (text) Answer content, not required, passed if the Knowledge is in qa mode
keywords (list) keyword, not required
enabled (bool) false/true, not required
Request
POST
/datasets/{dataset_id}/documents/{document_id}/segments/{segment_id}
curl --location --request POST 'http://127.0.0.1:5001/v1/datasets/{dataset_id}/documents/{document_id}/segments/{segment_id}' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json'\
--data-raw '{"segment": {"content": "1","answer": "1", "keywords": ["a"], "enabled": false}}'

Copy
Copied!
Response
{
  "data": [{
    "id": "",
    "position": 1,
    "document_id": "",
    "content": "1",
    "answer": "1",
    "word_count": 25,
    "tokens": 0,
    "keywords": [
        "a"
    ],
    "index_node_id": "",
    "index_node_hash": "",
    "hit_count": 0,
    "enabled": true,
    "disabled_at": null,
    "disabled_by": null,
    "status": "completed",
    "created_by": "",
    "created_at": 1695312007,
    "indexing_at": 1695312007,
    "completed_at": 1695312007,
    "error": null,
    "stopped_at": null
  }],
  "doc_form": "text_model"
}

Copy
Copied!
Error message
Name
code
Type
string
Description
Error code

Name
status
Type
number
Description
Error status

Name
message
Type
string
Description
Error message

Example
  {
    "code": "no_file_uploaded",
    "message": "Please upload your file.",
    "status": 400
  }

Copy
Copied!
code	status	message
no_file_uploaded	400	Please upload your file.
too_many_files	400	Only one file is allowed.
file_too_large	413	File size exceeded.
unsupported_file_type	415	File type not allowed.
high_quality_dataset_only	400	Current operation only supports 'high-quality' datasets.
dataset_not_initialized	400	The dataset is still being initialized or indexing. Please wait a moment.
archived_document_immutable	403	The archived document is not editable.
dataset_name_duplicate	409	The dataset name already exists. Please modify your dataset name.
invalid_action	400	Invalid action.
document_already_finished	400	The document has been processed. Please refresh the page or go to the document details.
document_indexing	400	The document is being processed and cannot be edited.
invalid_metadata	400	The metadata content is incorrect. Please check and verify.
