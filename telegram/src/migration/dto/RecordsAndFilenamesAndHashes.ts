import RecordsAndFilenames from "./RecordsAndFilenames";

export default interface RecordsAndFilenamesAndHashes extends RecordsAndFilenames {
    hashes: Record<string, string>;
}
