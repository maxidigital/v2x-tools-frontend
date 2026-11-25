# FAQ

<!-- Source of public/doc/faq.html (regenerate with doc-src/md2doc.py). Also meant for the chat and the MCP: keep it plain Markdown. -->

Short answers about what asn1click does and doesn't do. For how-to guides and the API reference, see the [documentation](https://v2x.tools/doc/); for recent changes, see [What's new](./changelog).

## Data and privacy

### Do you store the payloads I decode or encode?
No. Payloads are processed in memory and are neither stored nor logged. Anonymous usage analytics record error messages, which may quote a single field value. Through an AI assistant ([MCP](https://v2x.tools/doc/mcp.html), chat) the AI provider sees the payloads; for confidential data use the web UI or the API.

### Who can see the ASN.1 modules I upload?
Only you. Uploaded modules are private to your account.

## Messages and standards

### Which messages are supported?
The ETSI C-ITS message set: CAM, DENM, CPM, VAM, MAPEM, SPATEM, IVIM, SREM, SSEM and RTCMEM, in several versions, plus the dictionaries they use (CDD/ITS-Container, ISO 19091 DSRC, ISO 19321 IVI, ISO 14906 EFC, ISO 24534 ERI). The full list is in the module browser and in the MCP (`list_modules`).

### How does auto-detect pick a version?
From the ITS PDU header (`protocolVersion` + `messageID`). The public default is the newest version we have for that message; the result shows which definition was used ("Auto-detected as …"). You can always pick a version explicitly, and signed-in users can set their own default per message type.

### Can I decode SAE J2735 messages (BSM, MAP, SPaT, TIM)?
Not yet. J2735 is on the roadmap. Its message frame relies on ASN.1 information object classes that our parser does not fully support yet (see [Known limitations](#known-limitations)).

### Can I use the ETSI MAPEM/SPATEM definitions to decode J2735 MAP or SPaT?
No, even though they look almost identical. ETSI's DSRC module (TS 103 301) takes some types from the ETSI Common Data Dictionary instead of defining them like J2735:

- **Longitude**: ETSI `-1800000000..1800000001`, J2735 `-1799999999..1800000001`. UPER encodes a value as its distance from the lower bound, so the same bytes decode **1 unit (0.1 µdeg) apart**. If your J2735 MAP decodes with a longitude off by one, this is why.
- **Iso3833VehicleType** (in SREM/SSEM requestor data) has a different range, which changes its size on the wire and shifts every field after it.
- Latitude and StationID are the same in both.

### Which encodings are supported?
UPER for binary, and JER (JSON) and XER (XML) for text, following X.691, X.697 and X.693. OER/COER (used by IEEE 1609.2 / ETSI TS 103 097 security headers) and aligned PER (APER, used by 3GPP) are not supported yet.

### My JSON or XML from before November 2026 is rejected. Why?
On 2026-11-24 JER and XER were changed to follow the standards: enumerations by name, BIT STRING in hex, field names exactly as in the ASN.1 (`long`, not `longint`). Regenerate or convert your samples. Details in [What's new](./changelog).

## Interoperability

### Why can my result differ from Vanetza or other asn1c-based stacks?
asn1c departs from X.691 in a few places: it merges extension additions into the root of some constraints (e.g. `PathPredicted`, `DeltaPositions`), drops SIZE extensibility after `WITH COMPONENT`, and drops the extension bit of some open-type ids (CAM 2.3.1 extension containers). asn1click follows X.691 by default, like Objective Systems and asn1tools. Choose **asn1c / Vanetza** in the rules selector (API: `X-Compat: asn1c`) to get byte-identical output with those stacks. See [Web tools](https://v2x.tools/doc/web-tools.html) and the [API reference](https://v2x.tools/doc/api.html).

### Can I paste a full captured packet (GeoNetworking + security header + BTP)?
Not yet. Paste only the message itself (the bytes starting with the ITS PDU header). Unwrapping GeoNetworking, BTP and IEEE 1609.2 / TS 103 097 secured packets is on the roadmap.

### How is this different from Wireshark, asn1c or the USDOT ConnectedVCS validator?
- **Wireshark** decodes ETSI messages inside packet captures, with the ASN.1 versions compiled into your Wireshark build. asn1click works from a hex string, encodes and generates messages, lets you choose the version, explains why a payload is invalid, and has an API and an MCP server.
- **asn1c** compiles ASN.1 into C code; asn1click needs no build step.
- **The ConnectedVCS Message Validator** (USDOT) validates SAE J2735 3/2016 messages. asn1click does not support J2735 yet; it covers the ETSI and ISO messages above.

## Known limitations

- **Lengths of 16K or more** (X.691 fragmentation) are not supported: such values are refused with an error, never encoded wrongly. In practice this only matters for 3GPP-size messages.
- **ASN.1 features not yet supported in uploaded modules:** `OBJECT IDENTIFIER` as a field type, general parameterized types (`Container { {Set} }`), and general information object class field references with table constraints (`CLASS.&field ({Set}{@id})`). The forms used by the ETSI messages are supported.
- **Physical units in `set`** (`41.3875 degree`) work only where the schema declares a unit (`@unit`). Some types don't (e.g. `HeadingValue` in CDD 4.3); use the raw integer there. Syntax: [Generate and set](https://v2x.tools/doc/messages.html#set).
- **The public modules contain small extensions of ours** (for example named values in the ITS PDU header), so not every stored module compiles unchanged in other ASN.1 tools. Clean copies are planned.
