# Helix domain glossary

## Scan

A completed assessment of one trace. A Scan counts toward usage only when its assessment completes successfully; rejected, failed, and blocked work does not count.

## Connection

An operator-controlled relationship to a LangSmith project. A Connection pauses when its owner lacks Pro entitlement and resumes only through an explicit operator action after entitlement is restored.

## Batch

A requested group of traces assessed together. A Batch starts only when every requested Scan fits within the owner's remaining entitlement; it never partly starts because of an entitlement limit.

## Metering event

The durable usage record for one completed Pro Scan. Delivery to the payment provider may retry, but it never changes whether the Scan completed.
