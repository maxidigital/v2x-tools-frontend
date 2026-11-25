# What's new

<!-- Source of public/doc/changelog.html (regenerate with doc-src/md2doc.py). Newest first. -->

## 2026-11-24

> **Breaking change for JSON and XML users.** JER and XER now follow the standards (X.697 / X.693).
> JSON or XML produced before this date may no longer be accepted. See the list below and re-export your samples.

- **Standard JER and XER**, verified against asn1tools:
  - ENUMERATED values are written by identifier (`"alt-000-20"` in JER, `<alt-000-20/>` in XER), not as numbers.
  - BOOLEAN in XER is `<true/>` / `<false/>`.
  - BIT STRING in JER is hex: `"52"`, or `{"value": "52", "length": 7}` when the size is not fixed. JER strings of `0`/`1` are no longer read (`set` still accepts them).
  - The XER root element is the type name (`<CAM>…</CAM>`), and lists follow X.693.
  - INTEGER values with a name (e.g. `unavailable`) are written as numbers in JER, as X.697 requires. Some tools, asn1tools among them, write the name instead.
- **Field names exactly as in the ASN.1**: `long`, `node-XY1` (previously `longint`, `node_XY1`).
- **All formats check constraints.** JER and XER used to accept out-of-range values; now they are rejected like in UPER.
- **Generate:** the content option is now `MINIMAL`, `RANDOM` or `FULL` (replaces the five sizes). Realistic messages stay under 410 bytes.
  - **API default changed:** `POST /api/generate` without `content` now returns a `MINIMAL` message (it used to return a small random one). `size` and `minimal` are no longer used. See the [API reference](https://v2x.tools/doc/api.html).
- **Generate with `set`:** fix individual fields with `path=value` lines, e.g. `header.stationID=1234`. Physical units are converted for you when the schema declares one (`lat=41.3875 degree`, `speedValue=13.89 m/s`); named numbers, enumerations and named bits accept their names (`stationType=passengerCar`, `{ingressPath}`). [Syntax](https://v2x.tools/doc/messages.html#set).
- **[MCP](https://v2x.tools/doc/mcp.html):** new `validate` tool. `generate` and `encode` accept just the message type (`CAM`, `MAPEM`, `MAP`…) and use its default version.
- **Fix:** some malformed module uploads could make the server hang; they now return a clear error within seconds.

## 2026-11-19

- **CAM 2.3.1** (ETSI TS 103 900) added; it is now the default for auto-detected CAMs. CAM v2 stays available by name.
- **IVIM** now uses IVI version 2 (ISO/TS 19321:2020), with the GDD and EFC modules it needs.
- **"Auto-detected as …"** label on results, and a **Versions** dialog showing which definition is used for each message type. Signed-in users can choose their own default per message type.
- **Rules selector:** X.691 standard (default) or asn1c/Vanetza compatibility (see the [FAQ](./faq#why-can-my-result-differ-from-vanetza-or-other-asn1c-based-stacks)).

## 2026-11-18

- **Encoding fixes** found by checking every type against an independent implementation (asn1tools):
  - DEFAULT fields now carry their presence bit (X.691). Messages with DEFAULT fields, such as DENM 2.2, used to decode wrongly from that field on.
  - NULL, IA5String/NumericString names (MAPEM/SPATEM), extensible BIT STRINGs (CPM/DENM) and several length rules are now encoded correctly.
  - If you stored UPER payloads produced by v2x.tools before this date for those messages, re-encode them.
- **New modules:** CDD 4.3 (TS 102 894-2 v2.4.1), DENM 2.3.1 (TS 103 831; now the default for auto-detected DENMs), VAM 2.3.1 (TS 103 300-3).
- **asn1c / Vanetza compatibility mode** (`X-Compat: asn1c` in the API, `compat` in the MCP).
- **Auto-detect defaults:** the public default for each message type is the newest version; responses say which one was used (`X-Resolved-Ref`, `X-Resolved-Message`, `X-Auto-Detected`).
